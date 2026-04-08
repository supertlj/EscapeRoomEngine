import EventBus from '../core/EventBus.js';

/**
 * Game loop: timer countdown (ticks once per second), dirty-flag check.
 * Does NOT drive rendering at 60fps — the Renderer uses dirty-flag redraws.
 * This loop handles timer and periodic state checks only.
 */
export default class GameLoop {
  /**
   * @param {import('../core/StateManager.js').default} state
   */
  constructor(state) {
    this.state = state;
    this.running = false;
    this._intervalId = null;
    this._lastTick = 0;
  }

  start(timerSeconds) {
    if (this.running) return;
    this.state.timerRemaining = timerSeconds;
    this.running = true;
    this._lastTick = performance.now();

    EventBus.emit('timer:update', { remaining: this.state.timerRemaining });

    this._intervalId = setInterval(() => {
      if (!this.running) return;
      this._tick();
    }, 1000);
  }

  _tick() {
    if (this.state.timerRemaining <= 0) return;

    this.state.timerRemaining--;
    EventBus.emit('timer:update', { remaining: this.state.timerRemaining });

    if (this.state.timerRemaining <= 0) {
      this.stop();
      EventBus.emit('action:gameLose', {});
    }
  }

  stop() {
    this.running = false;
    if (this._intervalId !== null) {
      clearInterval(this._intervalId);
      this._intervalId = null;
    }
  }

  /** Resume from saved timer value */
  resume() {
    if (this.running) return;
    if (this.state.timerRemaining <= 0) return;
    this.running = true;
    this._intervalId = setInterval(() => {
      if (!this.running) return;
      this._tick();
    }, 1000);
  }

  /** Format seconds as MM:SS */
  static formatTime(seconds) {
    if (seconds <= 0) return '00:00';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  destroy() {
    this.stop();
  }
}
