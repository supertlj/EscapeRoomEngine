import EventBus from '../core/EventBus.js';

/**
 * Editor canvas: renders hotspots with selection outlines and resize handles.
 * Handles select, drag-move, and handle-resize via pointer events.
 */
export default class EditorCanvas {
  /**
   * @param {HTMLCanvasElement} canvas - main room canvas
   * @param {import('../core/RoomData.js').Room} room
   */
  constructor(canvas, room) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.room = room;
    this.selectedId = null;
    this.dpr = window.devicePixelRatio || 1;

    // Drag state
    this._mode = 'idle'; // 'idle' | 'dragging' | 'resizing'
    this._dragHandle = null; // 'tl'|'tr'|'bl'|'br' or null
    this._dragStart = null;  // { lx, ly, bounds: {...} }

    this._onPointerDown = this._onPointerDown.bind(this);
    this._onPointerMove = this._onPointerMove.bind(this);
    this._onPointerUp = this._onPointerUp.bind(this);

    canvas.addEventListener('pointerdown', this._onPointerDown);
    canvas.addEventListener('pointermove', this._onPointerMove);
    canvas.addEventListener('pointerup', this._onPointerUp);
    canvas.addEventListener('pointercancel', this._onPointerUp);
    canvas.addEventListener('contextmenu', e => e.preventDefault());

    this._initCanvas();
    this.render();
  }

  setRoom(room) {
    this.room = room;
    this.selectedId = null;
    this._initCanvas();
    this.render();
  }

  _initCanvas() {
    this.dpr = window.devicePixelRatio || 1;
    this.canvas.width = this.room.width * this.dpr;
    this.canvas.height = this.room.height * this.dpr;
    this.canvas.style.width = this.room.width + 'px';
    this.canvas.style.height = this.room.height + 'px';
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
  }

  _screenToLogical(clientX, clientY) {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: (clientX - rect.left) * (this.room.width / rect.width),
      y: (clientY - rect.top) * (this.room.height / rect.height)
    };
  }

  getSelected() {
    if (!this.selectedId) return null;
    return this.room.hotspots.find(h => h.id === this.selectedId) || null;
  }

  selectHotspot(id) {
    this.selectedId = id;
    this.render();
    EventBus.emit('editor:select', { hotspotId: id });
  }

  deselectAll() {
    this.selectedId = null;
    this.render();
    EventBus.emit('editor:deselect', {});
  }

  // --- Pointer Events ---

  _onPointerDown(e) {
    e.preventDefault();
    const p = this._screenToLogical(e.clientX, e.clientY);

    // Check if clicking a resize handle of the selected hotspot
    if (this.selectedId) {
      const handle = this._hitHandle(p.x, p.y);
      if (handle) {
        const hs = this.getSelected();
        this._mode = 'resizing';
        this._dragHandle = handle;
        this._dragStart = { lx: p.x, ly: p.y, bounds: { ...hs.bounds } };
        return;
      }
    }

    // Hit test hotspots (top zIndex first)
    const hit = this._hitTest(p.x, p.y);
    if (hit) {
      this.selectHotspot(hit.id);
      this._mode = 'dragging';
      this._dragStart = { lx: p.x, ly: p.y, bounds: { ...hit.bounds } };
    } else {
      this.deselectAll();
    }
  }

  _onPointerMove(e) {
    if (this._mode === 'idle' || !this._dragStart) return;

    const p = this._screenToLogical(e.clientX, e.clientY);
    const dx = p.x - this._dragStart.lx;
    const dy = p.y - this._dragStart.ly;
    const hs = this.getSelected();
    if (!hs) return;

    const orig = this._dragStart.bounds;

    if (this._mode === 'dragging') {
      hs.bounds.x = Math.round(orig.x + dx);
      hs.bounds.y = Math.round(orig.y + dy);
    } else if (this._mode === 'resizing') {
      const minSize = 20;
      switch (this._dragHandle) {
        case 'br':
          hs.bounds.w = Math.max(minSize, Math.round(orig.w + dx));
          hs.bounds.h = Math.max(minSize, Math.round(orig.h + dy));
          break;
        case 'bl':
          hs.bounds.x = Math.round(orig.x + dx);
          hs.bounds.w = Math.max(minSize, Math.round(orig.w - dx));
          hs.bounds.h = Math.max(minSize, Math.round(orig.h + dy));
          break;
        case 'tr':
          hs.bounds.y = Math.round(orig.y + dy);
          hs.bounds.w = Math.max(minSize, Math.round(orig.w + dx));
          hs.bounds.h = Math.max(minSize, Math.round(orig.h - dy));
          break;
        case 'tl':
          hs.bounds.x = Math.round(orig.x + dx);
          hs.bounds.y = Math.round(orig.y + dy);
          hs.bounds.w = Math.max(minSize, Math.round(orig.w - dx));
          hs.bounds.h = Math.max(minSize, Math.round(orig.h - dy));
          break;
      }
    }

    this.render();
    EventBus.emit('editor:hotspotMoved', { hotspot: hs });
  }

  _onPointerUp() {
    if (this._mode !== 'idle') {
      EventBus.emit('editor:changed', {});
    }
    this._mode = 'idle';
    this._dragHandle = null;
    this._dragStart = null;
  }

  // --- Hit Testing ---

  _hitTest(lx, ly) {
    const sorted = [...this.room.hotspots].sort((a, b) => b.zIndex - a.zIndex);
    for (const hs of sorted) {
      if (hs.containsPoint(lx, ly)) return hs;
    }
    return null;
  }

  _hitHandle(lx, ly) {
    const hs = this.getSelected();
    if (!hs) return null;
    const b = hs.bounds;
    const hs_size = 8;
    const handles = {
      tl: { x: b.x, y: b.y },
      tr: { x: b.x + b.w, y: b.y },
      bl: { x: b.x, y: b.y + b.h },
      br: { x: b.x + b.w, y: b.y + b.h }
    };
    for (const [name, pos] of Object.entries(handles)) {
      if (Math.abs(lx - pos.x) <= hs_size && Math.abs(ly - pos.y) <= hs_size) {
        return name;
      }
    }
    return null;
  }

  // --- Rendering ---

  render() {
    const ctx = this.ctx;
    const room = this.room;

    // Background
    if (room.background.type === 'image' && room.background._img) {
      ctx.drawImage(room.background._img, 0, 0, room.width, room.height);
    } else if (room.background.type === 'color') {
      ctx.fillStyle = room.background.value;
      ctx.fillRect(0, 0, room.width, room.height);
    } else {
      ctx.fillStyle = '#3a3a2a';
      ctx.fillRect(0, 0, room.width, room.height);
    }

    // Draw grid
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 1;
    for (let x = 0; x < room.width; x += 50) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, room.height); ctx.stroke();
    }
    for (let y = 0; y < room.height; y += 50) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(room.width, y); ctx.stroke();
    }

    // Hotspots sorted by zIndex
    const sorted = [...room.hotspots].sort((a, b) => a.zIndex - b.zIndex);

    for (const hs of sorted) {
      const b = hs.bounds;
      const isSelected = hs.id === this.selectedId;

      ctx.save();

      // Fill / Image
      if (hs.shape === 'circle') {
        ctx.beginPath();
        ctx.ellipse(b.x + b.w/2, b.y + b.h/2, b.w/2, b.h/2, 0, 0, Math.PI * 2);
        if (hs.appearance._img) {
          ctx.save();
          ctx.clip();
          ctx.drawImage(hs.appearance._img, b.x, b.y, b.w, b.h);
          ctx.restore();
        } else {
          ctx.fillStyle = hs.appearance.fill || 'rgba(100,100,100,0.5)';
          ctx.fill();
        }
      } else {
        if (hs.appearance._img) {
          ctx.drawImage(hs.appearance._img, b.x, b.y, b.w, b.h);
        } else {
          ctx.fillStyle = hs.appearance.fill || 'rgba(100,100,100,0.5)';
          ctx.fillRect(b.x, b.y, b.w, b.h);
        }
      }

      // Editor outline
      ctx.strokeStyle = isSelected ? '#fff' : 'rgba(0,200,255,0.6)';
      ctx.lineWidth = isSelected ? 2 : 1;
      ctx.setLineDash(isSelected ? [] : [4, 4]);
      if (hs.shape === 'circle') {
        ctx.beginPath();
        ctx.ellipse(b.x + b.w/2, b.y + b.h/2, b.w/2, b.h/2, 0, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        ctx.strokeRect(b.x, b.y, b.w, b.h);
      }
      ctx.setLineDash([]);

      // Label (skip if has image, show as small overlay label instead)
      if (hs.appearance._img) {
        // Small label at bottom of hotspot
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(b.x, b.y + b.h - 16, b.w, 16);
        ctx.fillStyle = '#fff';
        ctx.font = '10px system-ui';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(hs.label || hs.id, b.x + b.w/2, b.y + b.h - 8);
      } else {
        ctx.fillStyle = isSelected ? '#fff' : 'rgba(0,200,255,0.8)';
        ctx.font = '11px system-ui';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(hs.label || hs.id, b.x + b.w/2, b.y + b.h/2);
      }

      // Resize handles for selected
      if (isSelected) {
        const handleSize = 7;
        const corners = [
          [b.x, b.y], [b.x + b.w, b.y],
          [b.x, b.y + b.h], [b.x + b.w, b.y + b.h]
        ];
        for (const [cx, cy] of corners) {
          ctx.fillStyle = '#fff';
          ctx.fillRect(cx - handleSize/2, cy - handleSize/2, handleSize, handleSize);
          ctx.strokeStyle = '#333';
          ctx.lineWidth = 1;
          ctx.strokeRect(cx - handleSize/2, cy - handleSize/2, handleSize, handleSize);
        }
      }

      ctx.restore();
    }
  }

  deleteSelected() {
    if (!this.selectedId) return;
    const idx = this.room.hotspots.findIndex(h => h.id === this.selectedId);
    if (idx !== -1) {
      this.room.hotspots.splice(idx, 1);
      this.selectedId = null;
      this.render();
      EventBus.emit('editor:deselect', {});
      EventBus.emit('editor:changed', {});
    }
  }

  destroy() {
    this.canvas.removeEventListener('pointerdown', this._onPointerDown);
    this.canvas.removeEventListener('pointermove', this._onPointerMove);
    this.canvas.removeEventListener('pointerup', this._onPointerUp);
    this.canvas.removeEventListener('pointercancel', this._onPointerUp);
  }
}
