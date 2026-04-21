import EventBus from '../core/EventBus.js';

/**
 * Progressive hint system with cooldown.
 * Hints become available after 3 failed puzzle attempts.
 * Each hint reveals one more clue from the room's hints array.
 */
export default class HintSystem {
  /**
   * @param {import('../core/StateManager.js').default} state
   * @param {string[]} hints - ordered hint strings from room data
   */
  constructor(state, hints = []) {
    this.state = state;
    this.hints = hints;
  }

  setHints(hints) {
    this.hints = hints || [];
  }

  /** Can the player request a hint right now? */
  canUseHint() {
    return this.state.hintsUsed < this.hints.length;
  }

  /** Get the total number of hints available */
  getTotalHints() {
    return this.hints.length;
  }

  /** Get how many hints have been used */
  getHintsUsed() {
    return this.state.hintsUsed;
  }

  /** Get how many hints remain */
  getHintsRemaining() {
    return Math.max(0, this.hints.length - this.state.hintsUsed);
  }

  /** Request a hint. Returns the hint text or null. */
  requestHint() {
    if (!this.canUseHint()) {
      EventBus.emit('action:showMessage', {
        message: 'No more hints available!',
        onDismiss: () => {}
      });
      return null;
    }

    const hint = this.hints[this.state.hintsUsed];
    this.state.hintsUsed++;

    EventBus.emit('hint:used', {
      hint,
      hintsUsed: this.state.hintsUsed,
      hintsRemaining: this.getHintsRemaining()
    });

    // Object hint { hotspotId } → visual circle on the canvas (no words)
    // String hint → legacy text popup (other rooms still use this)
    if (hint && typeof hint === 'object' && hint.hotspotId) {
      EventBus.emit('hint:show', { hotspotId: hint.hotspotId });
    } else if (typeof hint === 'string') {
      EventBus.emit('action:showMessage', {
        message: `Hint: ${hint}`,
        onDismiss: () => {}
      });
    }

    return hint;
  }
}
