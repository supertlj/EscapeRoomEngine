import EventBus from '../core/EventBus.js';

/**
 * Modal dialog system: message popups and combination puzzle input.
 * Creates DOM elements once, shows/hides as needed.
 */
export default class DialogUI {
  constructor(container) {
    this.container = container;
    this._onDismiss = null;
    this._onPuzzleComplete = null;

    this._createMessageDialog();
    this._createPuzzleDialog();
    this._createWinDialog();

    // Listen for action events
    EventBus.on('action:showMessage', (data) => this.showMessage(data.message, data.onDismiss));
    EventBus.on('action:triggerPuzzle', (data) => this._handlePuzzleTrigger(data));
    EventBus.on('action:gameWin', () => this.showWin());
    EventBus.on('action:gameLose', () => this.showLose());
  }

  // --- Message Dialog ---

  _createMessageDialog() {
    this.messageOverlay = document.createElement('div');
    this.messageOverlay.className = 'message-overlay hidden';
    this.messageOverlay.innerHTML = `
      <div class="message-box">
        <p class="message-text"></p>
        <button class="dismiss">OK</button>
      </div>
    `;
    this.container.appendChild(this.messageOverlay);

    const btn = this.messageOverlay.querySelector('.dismiss');
    btn.addEventListener('click', () => this._dismissMessage());
    this.messageOverlay.addEventListener('click', (e) => {
      if (e.target === this.messageOverlay) this._dismissMessage();
    });
  }

  showMessage(text, onDismiss) {
    this.messageOverlay.querySelector('.message-text').textContent = text;
    this.messageOverlay.classList.remove('hidden');
    this._onDismiss = onDismiss || null;
  }

  _dismissMessage() {
    this.messageOverlay.classList.add('hidden');
    const cb = this._onDismiss;
    this._onDismiss = null;
    if (cb) cb();
  }

  // --- Combination Puzzle Dialog ---

  _createPuzzleDialog() {
    this.puzzleOverlay = document.createElement('div');
    this.puzzleOverlay.className = 'puzzle-overlay hidden';
    this.puzzleOverlay.innerHTML = `
      <div class="puzzle-box">
        <p class="puzzle-prompt"></p>
        <input type="text" class="puzzle-input" maxlength="20" autocomplete="off" />
        <div class="puzzle-buttons">
          <button class="puzzle-submit">SUBMIT</button>
          <button class="puzzle-cancel">Cancel</button>
        </div>
      </div>
    `;
    this.container.appendChild(this.puzzleOverlay);

    this.puzzleOverlay.querySelector('.puzzle-submit').addEventListener('click', () => {
      this._submitPuzzle();
    });
    this.puzzleOverlay.querySelector('.puzzle-cancel').addEventListener('click', () => {
      this._cancelPuzzle();
    });
    this.puzzleOverlay.querySelector('.puzzle-input').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this._submitPuzzle();
    });
  }

  showPuzzle(prompt, solution, onComplete) {
    this._puzzleSolution = solution;
    this._onPuzzleComplete = onComplete;
    this.puzzleOverlay.querySelector('.puzzle-prompt').textContent = prompt;
    const input = this.puzzleOverlay.querySelector('.puzzle-input');
    input.value = '';
    this.puzzleOverlay.classList.remove('hidden');
    setTimeout(() => input.focus(), 100);
  }

  _submitPuzzle() {
    const input = this.puzzleOverlay.querySelector('.puzzle-input');
    const answer = input.value.trim();
    const solved = answer === this._puzzleSolution;
    this.puzzleOverlay.classList.add('hidden');
    const cb = this._onPuzzleComplete;
    this._onPuzzleComplete = null;
    if (cb) cb(solved);
  }

  _cancelPuzzle() {
    this.puzzleOverlay.classList.add('hidden');
    const cb = this._onPuzzleComplete;
    this._onPuzzleComplete = null;
    if (cb) cb(false);
  }

  _handlePuzzleTrigger(data) {
    // Find the puzzle in the current room (passed via event data or looked up)
    EventBus.emit('puzzle:requestData', {
      puzzleId: data.puzzleId,
      callback: (puzzle) => {
        if (!puzzle) {
          console.warn(`[DialogUI] Puzzle ${data.puzzleId} not found`);
          if (data.onComplete) data.onComplete(false);
          return;
        }

        if (puzzle.type === 'combination') {
          this.showPuzzle(puzzle.prompt, puzzle.solution, data.onComplete);
        } else {
          // Pattern puzzles don't use a dialog — they use in-room hotspot taps
          console.warn(`[DialogUI] Puzzle type "${puzzle.type}" not handled by dialog`);
          if (data.onComplete) data.onComplete(false);
        }
      }
    });
  }

  // --- Win / Lose ---

  _createWinDialog() {
    this.winOverlay = document.createElement('div');
    this.winOverlay.className = 'win-overlay hidden';
    this.winOverlay.innerHTML = `
      <div class="win-box">
        <h2 class="win-title">You Escaped!</h2>
        <p class="win-text">Congratulations! You solved all the puzzles.</p>
        <button class="win-btn">Back to Menu</button>
      </div>
    `;
    this.container.appendChild(this.winOverlay);

    this.winOverlay.querySelector('.win-btn').addEventListener('click', () => {
      window.location.href = 'index.html';
    });
  }

  showWin() {
    this.winOverlay.querySelector('.win-title').textContent = 'You Escaped!';
    this.winOverlay.querySelector('.win-text').textContent = 'Congratulations! You solved all the puzzles.';
    this.winOverlay.classList.remove('hidden');
  }

  showLose() {
    this.winOverlay.querySelector('.win-title').textContent = 'Time\'s Up!';
    this.winOverlay.querySelector('.win-text').textContent = 'You ran out of time. Try again?';
    this.winOverlay.querySelector('.win-btn').textContent = 'Try Again';
    this.winOverlay.classList.remove('hidden');
  }

  destroy() {
    this.messageOverlay.remove();
    this.puzzleOverlay.remove();
    this.winOverlay.remove();
  }
}
