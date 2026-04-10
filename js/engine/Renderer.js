import EventBus from '../core/EventBus.js';

/**
 * Canvas renderer with DPR scaling and dirty-flag redraw.
 * Does NOT redraw every frame. Call markDirty() when state changes.
 */
export default class Renderer {
  /** @param {HTMLCanvasElement} canvas */
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.room = null;
    this.dirty = true;
    this.dpr = window.devicePixelRatio || 1;
    this._rafId = null;
    this._visibilityOverrides = {};

    // Redraw on dirty flag via RAF (coalesces multiple markDirty calls)
    this._scheduleRedraw = () => {
      if (this._rafId !== null) return;
      this._rafId = requestAnimationFrame(() => {
        this._rafId = null;
        if (this.dirty) this._draw();
      });
    };
  }

  /**
   * Initialize canvas size from room dimensions.
   * CSS scales the canvas to fit viewport; internal resolution is room size * DPR.
   */
  setRoom(room, visibilityOverrides = {}) {
    this.room = room;
    this._visibilityOverrides = visibilityOverrides;
    this.dpr = window.devicePixelRatio || 1;

    // Set internal resolution
    this.canvas.width = room.width * this.dpr;
    this.canvas.height = room.height * this.dpr;

    // Set CSS display size (actual scaling handled by CSS)
    this.canvas.style.width = room.width + 'px';
    this.canvas.style.height = room.height + 'px';

    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.markDirty();
  }

  /** Update visibility overrides from game state */
  setVisibilityOverrides(overrides) {
    this._visibilityOverrides = overrides;
    this.markDirty();
  }

  markDirty() {
    this.dirty = true;
    this._scheduleRedraw();
  }

  _draw() {
    if (!this.room) return;
    this.dirty = false;
    const ctx = this.ctx;
    const room = this.room;

    // Background
    if (room.background.type === 'color') {
      ctx.fillStyle = room.background.value;
      ctx.fillRect(0, 0, room.width, room.height);
    } else if (room.background.type === 'image' && room.background._img) {
      ctx.drawImage(room.background._img, 0, 0, room.width, room.height);
    } else {
      ctx.fillStyle = '#3a3a2a';
      ctx.fillRect(0, 0, room.width, room.height);
    }

    // Draw hotspots sorted by zIndex (lowest first = painted first)
    const sorted = [...room.hotspots].sort((a, b) => a.zIndex - b.zIndex);

    for (const hs of sorted) {
      // Check visibility: override takes precedence, then default
      const overrideKey = hs.id;
      const isVisible = overrideKey in this._visibilityOverrides
        ? this._visibilityOverrides[overrideKey]
        : hs.visible;

      if (!isVisible) continue;

      const b = hs.bounds;

      ctx.save();

      // Clip to shape for images
      if (hs.shape === 'circle') {
        ctx.beginPath();
        ctx.ellipse(b.x + b.w / 2, b.y + b.h / 2, b.w / 2, b.h / 2, 0, 0, Math.PI * 2);

        if (hs.appearance._img) {
          ctx.save();
          ctx.clip();
          ctx.drawImage(hs.appearance._img, b.x, b.y, b.w, b.h);
          ctx.restore();
        } else if (hs.appearance.fill) {
          ctx.fillStyle = hs.appearance.fill;
          ctx.fill();
        }
        if (hs.appearance.stroke && !hs.appearance._img) {
          ctx.beginPath();
          ctx.ellipse(b.x + b.w / 2, b.y + b.h / 2, b.w / 2, b.h / 2, 0, 0, Math.PI * 2);
          ctx.strokeStyle = hs.appearance.stroke;
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      } else {
        // rect
        if (hs.appearance._img) {
          ctx.drawImage(hs.appearance._img, b.x, b.y, b.w, b.h);
        } else if (hs.appearance.fill) {
          ctx.fillStyle = hs.appearance.fill;
          ctx.fillRect(b.x, b.y, b.w, b.h);
        }
        if (hs.appearance.stroke && !hs.appearance._img) {
          ctx.strokeStyle = hs.appearance.stroke;
          ctx.lineWidth = 2;
          ctx.strokeRect(b.x, b.y, b.w, b.h);
        }
      }

      // Label (only if no image, or as overlay)
      if (hs.label && !hs.appearance._img) {
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.font = '12px system-ui';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(hs.label, b.x + b.w / 2, b.y + b.h / 2);
      }

      ctx.restore();
    }

    if (window.DEBUG) {
      EventBus.emit('renderer:draw', { roomId: room.id });
    }
  }

  /** Convert screen (mouse/touch) coordinates to logical room coordinates */
  screenToLogical(screenX, screenY) {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.room.width / rect.width;
    const scaleY = this.room.height / rect.height;
    return {
      x: (screenX - rect.left) * scaleX,
      y: (screenY - rect.top) * scaleY
    };
  }

  destroy() {
    if (this._rafId !== null) {
      cancelAnimationFrame(this._rafId);
      this._rafId = null;
    }
  }
}
