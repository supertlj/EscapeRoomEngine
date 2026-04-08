import EventBus from '../core/EventBus.js';

/**
 * Touch/mouse input handler with hit testing.
 * Normalizes touch and mouse events into tap/long-press.
 * Converts screen coords to logical room coords via Renderer.
 */
export default class InputHandler {
  /**
   * @param {HTMLCanvasElement} canvas
   * @param {import('./Renderer.js').default} renderer
   */
  constructor(canvas, renderer) {
    this.canvas = canvas;
    this.renderer = renderer;
    this.room = null;
    this._visibilityOverrides = {};

    // Tap detection state
    this._pointerDown = null;  // { x, y, time }
    this._longPressTimer = null;

    // Config
    this.TAP_TIME = 300;        // max ms for a tap
    this.TAP_DISTANCE = 10;     // max px movement for a tap
    this.LONG_PRESS_TIME = 500; // ms for long-press

    // Bind handlers
    this._onPointerDown = this._onPointerDown.bind(this);
    this._onPointerUp = this._onPointerUp.bind(this);
    this._onPointerMove = this._onPointerMove.bind(this);

    canvas.addEventListener('pointerdown', this._onPointerDown);
    canvas.addEventListener('pointerup', this._onPointerUp);
    canvas.addEventListener('pointermove', this._onPointerMove);
    canvas.addEventListener('pointercancel', this._onPointerUp);

    // Prevent context menu on long press
    canvas.addEventListener('contextmenu', e => e.preventDefault());
  }

  setRoom(room, visibilityOverrides = {}) {
    this.room = room;
    this._visibilityOverrides = visibilityOverrides;
  }

  setVisibilityOverrides(overrides) {
    this._visibilityOverrides = overrides;
  }

  _onPointerDown(e) {
    e.preventDefault();
    this._pointerDown = {
      x: e.clientX,
      y: e.clientY,
      time: performance.now()
    };

    // Start long-press timer
    this._longPressTimer = setTimeout(() => {
      if (!this._pointerDown) return;
      const logical = this.renderer.screenToLogical(e.clientX, e.clientY);
      const hit = this._hitTest(logical.x, logical.y);
      EventBus.emit('input:longpress', { x: logical.x, y: logical.y, hotspot: hit });
      this._pointerDown = null; // consume the gesture
    }, this.LONG_PRESS_TIME);
  }

  _onPointerMove(e) {
    if (!this._pointerDown) return;
    const dx = e.clientX - this._pointerDown.x;
    const dy = e.clientY - this._pointerDown.y;
    if (Math.sqrt(dx * dx + dy * dy) > this.TAP_DISTANCE) {
      // Moved too far, cancel tap/longpress
      clearTimeout(this._longPressTimer);
      this._pointerDown = null;
    }
  }

  _onPointerUp(e) {
    clearTimeout(this._longPressTimer);
    if (!this._pointerDown) return;

    const elapsed = performance.now() - this._pointerDown.time;
    const dx = e.clientX - this._pointerDown.x;
    const dy = e.clientY - this._pointerDown.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    this._pointerDown = null;

    if (elapsed <= this.TAP_TIME && dist <= this.TAP_DISTANCE) {
      const logical = this.renderer.screenToLogical(e.clientX, e.clientY);
      const hit = this._hitTest(logical.x, logical.y);

      if (window.DEBUG) {
        console.log(`[tap] logical=(${logical.x.toFixed(1)}, ${logical.y.toFixed(1)}) hit=${hit ? hit.id : 'none'}`);
      }

      EventBus.emit('input:tap', { x: logical.x, y: logical.y, hotspot: hit });

      if (hit) {
        EventBus.emit('hotspot:tap', { hotspot: hit, x: logical.x, y: logical.y });
      }
    }
  }

  /**
   * Hit test against visible hotspots (highest zIndex first).
   * Returns the topmost hotspot containing the point, or null.
   */
  _hitTest(lx, ly) {
    if (!this.room) return null;
    const sorted = [...this.room.hotspots]
      .filter(hs => {
        const override = this._visibilityOverrides[hs.id];
        return override !== undefined ? override : hs.visible;
      })
      .sort((a, b) => b.zIndex - a.zIndex);

    for (const hs of sorted) {
      if (hs.containsPoint(lx, ly)) return hs;
    }
    return null;
  }

  destroy() {
    this.canvas.removeEventListener('pointerdown', this._onPointerDown);
    this.canvas.removeEventListener('pointerup', this._onPointerUp);
    this.canvas.removeEventListener('pointermove', this._onPointerMove);
    this.canvas.removeEventListener('pointercancel', this._onPointerUp);
    clearTimeout(this._longPressTimer);
  }
}
