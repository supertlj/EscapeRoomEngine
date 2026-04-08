import EventBus from './EventBus.js';

/**
 * Runtime game state: flags, inventory, visibility overrides, save/load.
 * Single save slot per room-set in localStorage.
 */
export default class StateManager {
  constructor(roomSetId = 'default') {
    this.roomSetId = roomSetId;
    this.reset();
  }

  reset() {
    this.currentRoomId = '';
    this.flags = {};
    this.inventory = [];           // array of item IDs
    this.puzzleAttempts = {};       // { puzzleId: count }
    this.firedOnceTriggers = new Set(); // "hotspotId:triggerIndex"
    this.patternProgress = {};     // { puzzleId: [hotspotId, ...] }
    this.timerRemaining = 0;
    this.hintsUsed = 0;
    this.hotspotVisibility = {};   // { hotspotId: bool } overrides
  }

  // --- Flags ---

  getFlag(flag) {
    return !!this.flags[flag];
  }

  setFlag(flag, value) {
    this.flags[flag] = !!value;
    EventBus.emit('state:flagChanged', { flag, value: !!value });
  }

  checkFlags(requiredFlags) {
    if (!requiredFlags || requiredFlags.length === 0) return true;
    return requiredFlags.every(f => this.getFlag(f));
  }

  // --- Inventory ---

  hasItem(itemId) {
    return this.inventory.includes(itemId);
  }

  addItem(itemId) {
    if (!this.hasItem(itemId)) {
      this.inventory.push(itemId);
      EventBus.emit('state:inventoryChanged', { action: 'add', itemId });
    }
  }

  removeItem(itemId) {
    const idx = this.inventory.indexOf(itemId);
    if (idx !== -1) {
      this.inventory.splice(idx, 1);
      EventBus.emit('state:inventoryChanged', { action: 'remove', itemId });
    }
  }

  // --- Hotspot Visibility ---

  getHotspotVisible(hotspotId, defaultVisible) {
    if (hotspotId in this.hotspotVisibility) {
      return this.hotspotVisibility[hotspotId];
    }
    return defaultVisible;
  }

  setHotspotVisible(hotspotId, visible) {
    this.hotspotVisibility[hotspotId] = visible;
    EventBus.emit('state:visibilityChanged', { hotspotId, visible });
  }

  // --- Once Triggers ---

  hasOnceFired(hotspotId, triggerIndex) {
    return this.firedOnceTriggers.has(`${hotspotId}:${triggerIndex}`);
  }

  markOnceFired(hotspotId, triggerIndex) {
    this.firedOnceTriggers.add(`${hotspotId}:${triggerIndex}`);
  }

  // --- Pattern Progress ---

  getPatternProgress(puzzleId) {
    return this.patternProgress[puzzleId] || [];
  }

  pushPatternStep(puzzleId, hotspotId) {
    if (!this.patternProgress[puzzleId]) {
      this.patternProgress[puzzleId] = [];
    }
    this.patternProgress[puzzleId].push(hotspotId);
  }

  resetPatternProgress(puzzleId) {
    delete this.patternProgress[puzzleId];
  }

  // --- Puzzle Attempts ---

  incrementPuzzleAttempts(puzzleId) {
    this.puzzleAttempts[puzzleId] = (this.puzzleAttempts[puzzleId] || 0) + 1;
  }

  getPuzzleAttempts(puzzleId) {
    return this.puzzleAttempts[puzzleId] || 0;
  }

  // --- Save / Load ---

  _storageKey() {
    return `ere_${this.roomSetId}`;
  }

  save() {
    const data = {
      roomSetId: this.roomSetId,
      currentRoomId: this.currentRoomId,
      flags: { ...this.flags },
      inventory: [...this.inventory],
      puzzleAttempts: { ...this.puzzleAttempts },
      firedOnceTriggers: [...this.firedOnceTriggers],
      patternProgress: { ...this.patternProgress },
      timerRemaining: this.timerRemaining,
      hintsUsed: this.hintsUsed,
      hotspotVisibility: { ...this.hotspotVisibility }
    };
    try {
      localStorage.setItem(this._storageKey(), JSON.stringify(data));
      return true;
    } catch (e) {
      console.warn('Save failed (storage quota?):', e);
      EventBus.emit('state:saveError', { error: e });
      return false;
    }
  }

  load() {
    try {
      const raw = localStorage.getItem(this._storageKey());
      if (!raw) return false;
      const data = JSON.parse(raw);
      this.currentRoomId = data.currentRoomId || '';
      this.flags = data.flags || {};
      this.inventory = data.inventory || [];
      this.puzzleAttempts = data.puzzleAttempts || {};
      this.firedOnceTriggers = new Set(data.firedOnceTriggers || []);
      this.patternProgress = data.patternProgress || {};
      this.timerRemaining = data.timerRemaining || 0;
      this.hintsUsed = data.hintsUsed || 0;
      this.hotspotVisibility = data.hotspotVisibility || {};
      return true;
    } catch (e) {
      console.warn('Load failed:', e);
      return false;
    }
  }

  clearSave() {
    localStorage.removeItem(this._storageKey());
  }

  toJSON() {
    return {
      roomSetId: this.roomSetId,
      currentRoomId: this.currentRoomId,
      flags: { ...this.flags },
      inventory: [...this.inventory],
      puzzleAttempts: { ...this.puzzleAttempts },
      firedOnceTriggers: [...this.firedOnceTriggers],
      patternProgress: { ...this.patternProgress },
      timerRemaining: this.timerRemaining,
      hintsUsed: this.hintsUsed,
      hotspotVisibility: { ...this.hotspotVisibility }
    };
  }
}
