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
    this.cooldownMs = 30000; // 30 second cooldown between hints
    this._lastHintTime = -Infinity;
  }

  setHints(hints) {
    this.hints = hints || [];
  }

  /** Can the player request a hint right now? */
  canUseHint() {
    // Must have hints remaining
    if (this.state.hintsUsed >= this.hints.length) return false;
    // Cooldown check
    if (performance.now() - this._lastHintTime < this.cooldownMs) return false;
    return true;
  }

  /** Get cooldown remaining in seconds (0 if ready) */
  getCooldownRemaining() {
    const elapsed = performance.now() - this._lastHintTime;
    const remaining = this.cooldownMs - elapsed;
    return remaining > 0 ? Math.ceil(remaining / 1000) : 0;
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
      const cooldown = this.getCooldownRemaining();
      if (cooldown > 0) {
        EventBus.emit('action:showMessage', {
          message: `Hint cooldown: wait ${cooldown}s`,
          onDismiss: () => {}
        });
      } else {
        EventBus.emit('action:showMessage', {
          message: 'No more hints available!',
          onDismiss: () => {}
        });
      }
      return null;
    }

    const hint = this.hints[this.state.hintsUsed];
    this.state.hintsUsed++;
    this._lastHintTime = performance.now();

    EventBus.emit('hint:used', {
      hint,
      hintsUsed: this.state.hintsUsed,
      hintsRemaining: this.getHintsRemaining()
    });

    EventBus.emit('action:showMessage', {
      message: `Hint: ${hint}`,
      onDismiss: () => {}
    });

    return hint;
  }
}
