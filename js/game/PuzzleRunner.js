import EventBus from '../core/EventBus.js';

/**
 * Evaluates triggers against game state, executes action chains.
 * Two responsibilities kept as separate methods:
 *   matchTrigger() — pure condition matching
 *   executeActions() — side-effecting action runner
 */
export default class PuzzleRunner {
  /**
   * @param {import('../core/StateManager.js').default} state
   * @param {import('../core/RoomData.js').Room} room
   */
  constructor(state, room) {
    this.state = state;
    this.room = room;
    this._actionQueue = [];
    this._processing = false;
    this._activePatternPuzzle = null; // puzzle ID if a pattern puzzle is active
  }

  setRoom(room) {
    this.room = room;
  }

  // --- Trigger Matching ---

  /**
   * Find the first matching trigger for a hotspot given current state.
   * @param {import('../core/RoomData.js').Hotspot} hotspot
   * @param {'tap'|'useItem'} inputType
   * @param {string|null} selectedItemId - currently selected inventory item
   * @returns {{ trigger: object, index: number } | null}
   */
  matchTrigger(hotspot, inputType, selectedItemId) {
    if (!hotspot.triggers) return null;

    for (let i = 0; i < hotspot.triggers.length; i++) {
      const t = hotspot.triggers[i];

      // Skip once-triggers that already fired
      if (t.once && this.state.hasOnceFired(hotspot.id, i)) continue;

      // Type matching
      if (t.type === 'useItem') {
        // useItem requires an item to be selected
        if (!selectedItemId) continue;
        // Must match the required item
        if (t.requiredItem && t.requiredItem !== selectedItemId) continue;
      } else if (t.type === 'tap') {
        // tap triggers are skipped when an item is selected
        if (selectedItemId) continue;
      }

      // Flag conditions
      if (!this.state.checkFlags(t.requiredFlags)) continue;

      // All conditions met — this trigger matches
      return { trigger: t, index: i };
    }

    return null;
  }

  /**
   * Evaluate a hotspot interaction: match trigger, then execute.
   * Called by the game loop when a hotspot is tapped.
   */
  handleHotspotTap(hotspot, selectedItemId) {
    const inputType = selectedItemId ? 'useItem' : 'tap';
    const match = this.matchTrigger(hotspot, inputType, selectedItemId);

    if (!match) {
      if (window.DEBUG) console.log(`[PuzzleRunner] No matching trigger for ${hotspot.id}`);
      return false;
    }

    const { trigger, index } = match;

    // Mark once-trigger as fired
    if (trigger.once) {
      this.state.markOnceFired(hotspot.id, index);
    }

    if (window.DEBUG) {
      console.log(`[PuzzleRunner] Matched ${hotspot.id} trigger[${index}] (${trigger.type})`);
    }

    // Execute actions
    this.executeActions(trigger.actions);
    return true;
  }

  // --- Action Execution ---

  /**
   * Execute an array of actions sequentially.
   * Actions that show UI (messages, puzzles) pause the chain
   * and resume after the UI is dismissed.
   */
  executeActions(actions) {
    if (!actions || actions.length === 0) return;

    // Queue actions for sequential processing
    this._actionQueue.push(...actions);
    if (!this._processing) {
      this._processNext();
    }
  }

  _processNext() {
    if (this._actionQueue.length === 0) {
      this._processing = false;
      EventBus.emit('puzzle:actionsComplete', {});
      return;
    }

    this._processing = true;
    const action = this._actionQueue.shift();
    this._executeOne(action);
  }

  _executeOne(action) {
    const p = action.params || {};

    switch (action.type) {
      case 'showMessage':
        // Emit event, wait for dialog dismissal to continue
        EventBus.emit('action:showMessage', {
          message: p.message,
          onDismiss: () => this._processNext()
        });
        return; // Don't call _processNext here — dialog will call it

      case 'setFlag':
        this.state.setFlag(p.flag, p.value);
        break;

      case 'giveItem':
        this.state.addItem(p.itemId);
        EventBus.emit('action:giveItem', { itemId: p.itemId });
        break;

      case 'removeItem':
        this.state.removeItem(p.itemId);
        EventBus.emit('action:removeItem', { itemId: p.itemId });
        break;

      case 'showHotspot':
        this.state.setHotspotVisible(p.hotspotId, true);
        break;

      case 'hideHotspot':
        this.state.setHotspotVisible(p.hotspotId, false);
        break;

      case 'triggerPuzzle': {
        const puzzle = this.room.getPuzzle(p.puzzleId);
        if (puzzle && puzzle.type === 'pattern') {
          // Pattern puzzles activate in-room hotspot sequence mode
          this._activePatternPuzzle = p.puzzleId;
          this.state.resetPatternProgress(p.puzzleId);
          EventBus.emit('puzzle:patternStarted', { puzzleId: p.puzzleId, solution: puzzle.solution });
          EventBus.emit('action:showMessage', {
            message: puzzle.prompt || 'Tap the correct sequence...',
            onDismiss: () => this._processNext()
          });
          return;
        }
        // Combination and other dialog-based puzzles
        EventBus.emit('action:triggerPuzzle', {
          puzzleId: p.puzzleId,
          onComplete: (solved) => {
            if (solved) {
              const pz = this.room.getPuzzle(p.puzzleId);
              if (pz && pz.onSolve) {
                this._actionQueue.unshift(...pz.onSolve);
              }
            } else {
              const pz = this.room.getPuzzle(p.puzzleId);
              if (pz && pz.onFail) {
                this._actionQueue.unshift(...pz.onFail);
              }
              this.state.incrementPuzzleAttempts(p.puzzleId);
            }
            this._processNext();
          }
        });
        return;
      }

      case 'transitionRoom':
        EventBus.emit('action:transitionRoom', { roomId: p.roomId });
        // Clear the queue — we're leaving this room
        this._actionQueue = [];
        this._processing = false;
        return;

      case 'gameWin':
        EventBus.emit('action:gameWin', {});
        this._actionQueue = [];
        this._processing = false;
        return;

      case 'gameLose':
        EventBus.emit('action:gameLose', {});
        this._actionQueue = [];
        this._processing = false;
        return;

      default:
        console.warn(`[PuzzleRunner] Unknown action type: ${action.type}`);
    }

    // Continue to next action
    this._processNext();
  }

  /**
   * Handle item combining.
   * @param {object} itemA - selected item
   * @param {object} itemB - tapped item
   * @returns {boolean} true if combine succeeded
   */
  handleCombine(itemA, itemB) {
    // Check A.combinesWith === B.id first (selected item priority)
    let source = null;
    if (itemA.combinesWith === itemB.id) {
      source = itemA;
    } else if (itemB.combinesWith === itemA.id) {
      source = itemB;
    }

    if (!source || !source.combineResult) return false;

    // Verify combineResult item exists in room
    const resultItem = this.room.getItem(source.combineResult);
    if (!resultItem) {
      console.warn(`[PuzzleRunner] combineResult "${source.combineResult}" not found in room items`);
      return false;
    }

    this.state.removeItem(itemA.id);
    this.state.removeItem(itemB.id);
    this.state.addItem(source.combineResult);

    EventBus.emit('action:showMessage', {
      message: `Combined ${itemA.name} + ${itemB.name} → ${resultItem.name}`,
      onDismiss: () => {}
    });

    return true;
  }

  // --- Pattern Puzzle ---

  /** Is a pattern puzzle currently active? */
  isPatternActive() {
    return this._activePatternPuzzle !== null;
  }

  /**
   * Handle a hotspot tap during an active pattern puzzle.
   * @param {string} hotspotId
   * @returns {boolean} true if consumed by pattern logic
   */
  handlePatternTap(hotspotId) {
    if (!this._activePatternPuzzle) return false;

    const puzzle = this.room.getPuzzle(this._activePatternPuzzle);
    if (!puzzle) {
      this._activePatternPuzzle = null;
      return false;
    }

    const solution = puzzle.solution; // array of hotspot IDs
    this.state.pushPatternStep(puzzle.id, hotspotId);
    const progress = this.state.getPatternProgress(puzzle.id);

    // Check if the latest tap matches the expected position
    const expectedIndex = progress.length - 1;
    if (solution[expectedIndex] !== hotspotId) {
      // Wrong tap — reset
      this.state.resetPatternProgress(puzzle.id);
      this.state.incrementPuzzleAttempts(puzzle.id);
      EventBus.emit('puzzle:patternWrong', { puzzleId: puzzle.id, hotspotId });
      EventBus.emit('action:showMessage', {
        message: 'Wrong sequence. Try again.',
        onDismiss: () => {}
      });
      return true;
    }

    // Correct tap
    EventBus.emit('puzzle:patternCorrect', { puzzleId: puzzle.id, hotspotId, step: progress.length });

    if (progress.length === solution.length) {
      // Pattern complete — solved!
      this._activePatternPuzzle = null;
      this.state.resetPatternProgress(puzzle.id);
      EventBus.emit('puzzle:patternSolved', { puzzleId: puzzle.id });

      if (puzzle.onSolve) {
        this.executeActions(puzzle.onSolve);
      }
    }

    return true;
  }
}
