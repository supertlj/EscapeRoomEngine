import EventBus from './EventBus.js';
import { defaultSave, validateSave, CURRENT_SAVE_VERSION, GAME_ID } from './SaveSchema.js';
import { migrate } from './SaveMigrations.js';
import { SaveCorruptError, SaveQuotaExceededError } from './Errors.js';

/**
 * Runtime game state — extends per-room flags with chapter-scoped
 * persistence, version-aware load/save, and typed errors.
 *
 * SCHEMA: see SaveSchema.js. localStorage stores one blob per game id
 * (`ere_save_{gameId}`).
 *
 * SAVE FLOW:
 * ┌──────────────────────────────────────────────────────────────┐
 * │  toSaveBlob() → JSON.stringify → localStorage.setItem        │
 * │     │                                                        │
 * │     └─▶ on quota exceeded: throw SaveQuotaExceededError      │
 * │                                                              │
 * │  load() → localStorage.getItem → JSON.parse → validate       │
 * │     │                                                        │
 * │     ├─▶ malformed JSON          → SaveCorruptError           │
 * │     ├─▶ wrong gameId            → SaveCorruptError           │
 * │     ├─▶ version > current build → SaveVersionAheadError      │
 * │     ├─▶ version < current build → migrate()                  │
 * │     └─▶ shape invalid           → SaveCorruptError           │
 * └──────────────────────────────────────────────────────────────┘
 */
export default class StateManager {
  constructor(gameId = GAME_ID) {
    this.gameId = gameId;
    this.reset();
  }

  /** Reset to a fresh-player state in memory (does not touch storage). */
  reset() {
    const blank = defaultSave();
    this._hydrate(blank);
  }

  // --- Hydration / serialization ---

  /** Apply a save object to memory. Used by load() and reset(). */
  _hydrate(save) {
    this.currentChapter   = save.currentChapter;
    this.currentRoomId    = save.currentRoomId;
    this.completedChapters = [...(save.completedChapters || [])];
    this.completedRooms   = [...(save.completedRooms || [])];
    this.inventory        = [...(save.inventory || [])];
    this.chapterFlags     = JSON.parse(JSON.stringify(save.chapterFlags || {}));
    this.globalFlags      = { ...(save.globalFlags || {}) };
    this.choices          = { ...(save.choices || {}) };
    this.puzzleAttempts   = { ...(save.puzzleAttempts || {}) };
    this.firedOnceTriggers = new Set(save.firedOnceTriggers || []);
    this.patternProgress  = JSON.parse(JSON.stringify(save.patternProgress || {}));
    this.hotspotVisibility = { ...(save.hotspotVisibility || {}) };
    this.timerRemaining   = save.timerRemaining || 0;
    this.hintsUsed        = save.hintsUsed || 0;
    this.settings         = { ...defaultSave().settings, ...(save.settings || {}) };
    this.meta             = { ...(save.meta || {}) };
  }

  /** Build a save blob from current state. */
  toSaveBlob() {
    return {
      version: CURRENT_SAVE_VERSION,
      gameId: this.gameId,

      currentChapter: this.currentChapter,
      currentRoomId: this.currentRoomId,

      completedChapters: [...this.completedChapters],
      completedRooms: [...this.completedRooms],

      inventory: [...this.inventory],

      chapterFlags: JSON.parse(JSON.stringify(this.chapterFlags)),
      globalFlags: { ...this.globalFlags },
      choices: { ...this.choices },

      puzzleAttempts: { ...this.puzzleAttempts },
      firedOnceTriggers: [...this.firedOnceTriggers],
      patternProgress: JSON.parse(JSON.stringify(this.patternProgress)),
      hotspotVisibility: { ...this.hotspotVisibility },
      timerRemaining: this.timerRemaining,
      hintsUsed: this.hintsUsed,

      settings: { ...this.settings },

      meta: {
        createdAt: this.meta.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    };
  }

  // --- Flags (chapter-scoped + global) ---

  /**
   * Read a flag. By convention flag names that need chapter scoping
   * are looked up under the current chapter's flag dict; others fall
   * through to globalFlags. Pass an absolute name like "global:foo"
   * to force the global namespace.
   */
  getFlag(flag) {
    if (flag.startsWith('global:')) {
      return !!this.globalFlags[flag.slice(7)];
    }
    const bucket = this.chapterFlags[this.currentChapter];
    if (bucket && flag in bucket) return !!bucket[flag];
    if (flag in this.globalFlags) return !!this.globalFlags[flag];
    return false;
  }

  setFlag(flag, value) {
    const v = !!value;
    if (flag.startsWith('global:')) {
      this.globalFlags[flag.slice(7)] = v;
    } else {
      if (!this.chapterFlags[this.currentChapter]) {
        this.chapterFlags[this.currentChapter] = {};
      }
      this.chapterFlags[this.currentChapter][flag] = v;
    }
    EventBus.emit('state:flagChanged', { flag, value: v });
  }

  checkFlags(requiredFlags) {
    if (!requiredFlags || requiredFlags.length === 0) return true;
    return requiredFlags.every(f => this.getFlag(f));
  }

  // --- Choices (persistent player decisions) ---

  setChoice(key, value) {
    this.choices[key] = value;
    EventBus.emit('state:choiceMade', { key, value });
  }

  getChoice(key) {
    return this.choices[key];
  }

  // --- Inventory ---

  hasItem(itemId) { return this.inventory.includes(itemId); }

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
    if (hotspotId in this.hotspotVisibility) return this.hotspotVisibility[hotspotId];
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

  getPatternProgress(puzzleId) { return this.patternProgress[puzzleId] || []; }
  pushPatternStep(puzzleId, hotspotId) {
    if (!this.patternProgress[puzzleId]) this.patternProgress[puzzleId] = [];
    this.patternProgress[puzzleId].push(hotspotId);
  }
  resetPatternProgress(puzzleId) { delete this.patternProgress[puzzleId]; }

  // --- Puzzle Attempts ---

  incrementPuzzleAttempts(puzzleId) {
    this.puzzleAttempts[puzzleId] = (this.puzzleAttempts[puzzleId] || 0) + 1;
  }
  getPuzzleAttempts(puzzleId) { return this.puzzleAttempts[puzzleId] || 0; }

  // --- Completion tracking ---

  markRoomComplete(roomId) {
    if (!this.completedRooms.includes(roomId)) {
      this.completedRooms.push(roomId);
      EventBus.emit('state:roomComplete', { roomId });
    }
  }

  isRoomComplete(roomId) { return this.completedRooms.includes(roomId); }

  markChapterComplete(chapterId) {
    if (!this.completedChapters.includes(chapterId)) {
      this.completedChapters.push(chapterId);
      EventBus.emit('state:chapterComplete', { chapterId });
    }
  }

  isChapterComplete(chapterId) { return this.completedChapters.includes(chapterId); }

  setCurrentChapter(chapterId) {
    this.currentChapter = chapterId;
    EventBus.emit('state:chapterChanged', { chapterId });
  }

  // --- Settings ---

  setSetting(key, value) {
    this.settings[key] = value;
    EventBus.emit('state:settingChanged', { key, value });
  }

  // --- Save / Load ---

  _storageKey() { return `ere_save_${this.gameId}`; }

  /**
   * Persist current state.
   * @throws {SaveQuotaExceededError} if localStorage write fails.
   */
  save() {
    const blob = this.toSaveBlob();
    try {
      localStorage.setItem(this._storageKey(), JSON.stringify(blob));
      EventBus.emit('state:saved');
      return true;
    } catch (e) {
      throw new SaveQuotaExceededError(e);
    }
  }

  /**
   * Try to load saved state.
   * @returns {boolean} true if loaded, false if no save existed.
   * @throws {SaveCorruptError | SaveVersionAheadError}
   */
  load() {
    const raw = localStorage.getItem(this._storageKey());
    if (!raw) return false;

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (err) {
      throw new SaveCorruptError('Save data is malformed JSON', err);
    }

    if (!parsed || typeof parsed !== 'object') {
      throw new SaveCorruptError('Save data is not an object');
    }

    if (parsed.gameId !== this.gameId) {
      throw new SaveCorruptError(`Save data is for a different game (${parsed.gameId})`);
    }

    if (typeof parsed.version !== 'number') {
      throw new SaveCorruptError('Save data is missing version field');
    }

    // Migrate if older than current schema. Throws SaveVersionAheadError if newer.
    let migrated;
    try {
      migrated = migrate(parsed);
    } catch (err) {
      // SaveVersionAheadError bubbles up as-is. Other migration errors → corrupt.
      if (err.name === 'SaveVersionAheadError') throw err;
      throw new SaveCorruptError(`Migration failed: ${err.message}`, err);
    }

    const validation = validateSave(migrated);
    if (!validation.valid) {
      throw new SaveCorruptError(`Save shape invalid: ${validation.errors.join('; ')}`);
    }

    this._hydrate(migrated);
    EventBus.emit('state:loaded');
    return true;
  }

  /** Manual reset — used by the "Reset Save Data" recovery button. */
  clearSave() {
    localStorage.removeItem(this._storageKey());
    this.reset();
    EventBus.emit('state:reset');
  }

  /** Has any save in storage? */
  hasSave() {
    return localStorage.getItem(this._storageKey()) !== null;
  }

  /** Backwards-compat: editor uses this. */
  toJSON() { return this.toSaveBlob(); }
}
