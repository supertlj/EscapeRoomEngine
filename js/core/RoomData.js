/**
 * Data models for Room, RoomSet, Hotspot, Item, Puzzle.
 * Pure data classes with fromJSON/toJSON. No DOM, no state.
 */

export class Hotspot {
  constructor(data = {}) {
    this.id = data.id || '';
    this.label = data.label || '';
    this.shape = data.shape || 'rect'; // 'rect' | 'circle'
    this.bounds = { x: 0, y: 0, w: 80, h: 60, ...data.bounds };
    this.appearance = {
      fill: '#8B4513',
      stroke: '#5C3010',
      image: null,
      ...data.appearance
    };
    this.zIndex = data.zIndex ?? 0;
    this.visible = data.visible ?? true;
    this.triggers = (data.triggers || []).map(t => ({ ...t }));
    this.zoomView = data.zoomView || null; // close-up view data for ZoomViewUI
  }

  containsPoint(x, y) {
    const b = this.bounds;
    if (this.shape === 'circle') {
      const cx = b.x + b.w / 2;
      const cy = b.y + b.h / 2;
      const rx = b.w / 2;
      const ry = b.h / 2;
      return ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1;
    }
    return x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h;
  }

  toJSON() {
    return {
      id: this.id,
      label: this.label,
      shape: this.shape,
      bounds: { ...this.bounds },
      appearance: { ...this.appearance },
      zIndex: this.zIndex,
      visible: this.visible,
      triggers: this.triggers.map(t => ({ ...t, actions: t.actions.map(a => ({ ...a })) }))
    };
  }
}

export class Item {
  constructor(data = {}) {
    this.id = data.id || '';
    this.name = data.name || '';
    this.description = data.description || '';
    this.icon = { shape: 'rect', color: '#888', ...data.icon };
    this.combinesWith = data.combinesWith || null;
    this.combineResult = data.combineResult || null;
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      icon: { ...this.icon },
      combinesWith: this.combinesWith,
      combineResult: this.combineResult
    };
  }
}

export class Puzzle {
  constructor(data = {}) {
    this.id = data.id || '';
    this.type = data.type || 'combination'; // 'combination' | 'pattern'
    this.hotspotId = data.hotspotId || '';
    this.prompt = data.prompt || '';
    this.solution = data.solution || '';
    this.onSolve = data.onSolve || [];
    this.onFail = data.onFail || [];
  }

  toJSON() {
    return {
      id: this.id,
      type: this.type,
      hotspotId: this.hotspotId,
      prompt: this.prompt,
      solution: this.solution,
      onSolve: this.onSolve.map(a => ({ ...a })),
      onFail: this.onFail.map(a => ({ ...a }))
    };
  }
}

export class Room {
  constructor(data = {}) {
    this.id = data.id || '';
    this.name = data.name || 'Untitled Room';
    this.width = data.width || 800;
    this.height = data.height || 600;
    this.background = { type: 'color', value: '#3a3a2a', ...data.background };
    this.hotspots = (data.hotspots || []).map(h => new Hotspot(h));
    this.items = (data.items || []).map(i => new Item(i));
    this.puzzles = (data.puzzles || []).map(p => new Puzzle(p));
    this.hints = data.hints || [];
    this.onEnter = data.onEnter || [];
  }

  getHotspot(id) {
    return this.hotspots.find(h => h.id === id) || null;
  }

  getItem(id) {
    return this.items.find(i => i.id === id) || null;
  }

  getPuzzle(id) {
    return this.puzzles.find(p => p.id === id) || null;
  }

  /** Returns visible hotspots sorted by zIndex (highest on top) for hit testing */
  getVisibleHotspots() {
    return this.hotspots
      .filter(h => h.visible)
      .sort((a, b) => b.zIndex - a.zIndex);
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      width: this.width,
      height: this.height,
      background: { ...this.background },
      hotspots: this.hotspots.map(h => h.toJSON()),
      items: this.items.map(i => i.toJSON()),
      puzzles: this.puzzles.map(p => p.toJSON()),
      hints: [...this.hints],
      onEnter: this.onEnter.map(a => ({ ...a }))
    };
  }

  static fromJSON(json) {
    const data = typeof json === 'string' ? JSON.parse(json) : json;
    return new Room(data);
  }
}

export class RoomSet {
  constructor(data = {}) {
    this.id = data.id || '';
    this.name = data.name || 'Untitled';
    this.version = data.version || 1;
    this.rooms = data.rooms || [];      // filenames or inline Room objects
    this.startRoom = data.startRoom || '';
    this.globalItems = (data.globalItems || []).map(i => new Item(i));
    this.settings = { timerSeconds: 1800, ...data.settings };
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      version: this.version,
      rooms: [...this.rooms],
      startRoom: this.startRoom,
      globalItems: this.globalItems.map(i => i.toJSON()),
      settings: { ...this.settings }
    };
  }

  static fromJSON(json) {
    const data = typeof json === 'string' ? JSON.parse(json) : json;
    return new RoomSet(data);
  }
}
