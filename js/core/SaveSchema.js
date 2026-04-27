/**
 * SaveSchema — explicit shape of persistent player state.
 *
 * The save data contract. Bumped via CURRENT_SAVE_VERSION whenever
 * the shape changes. SaveMigrations registers a migrate function for
 * each version delta so old saves load cleanly forever.
 *
 * SHAPE (v1):
 * ┌────────────────────────────────────────────────────────────────┐
 * │ {                                                              │
 * │   version: 1,                  required                        │
 * │   gameId: "cipher-1892",       required (rejects foreign saves)│
 * │                                                                │
 * │   currentChapter: "c01",       chapter the player is in        │
 * │   currentRoomId: "apartment",  room within that chapter        │
 * │                                                                │
 * │   completedChapters: [],       chapter ids done in order       │
 * │   completedRooms: ["apartment"], room ids done                 │
 * │                                                                │
 * │   inventory: ["keycard"],      item ids (carried across chap)  │
 * │                                                                │
 * │   chapterFlags: {              per-chapter scoped flags        │
 * │     "c01": { "laptop_unlocked": true }                         │
 * │   },                                                           │
 * │   globalFlags: {},             flags that span chapters        │
 * │                                                                │
 * │   choices: {                   player decisions, persist forever│
 * │     "ethics_file_read": "shred"                                │
 * │   },                                                           │
 * │                                                                │
 * │   puzzleAttempts: {},          { puzzleId: count }             │
 * │   firedOnceTriggers: [],       "hotspotId:triggerIndex"        │
 * │   patternProgress: {},         in-flight pattern puzzle state  │
 * │   hotspotVisibility: {},       runtime visibility overrides    │
 * │   timerRemaining: 0,           seconds left if room has timer  │
 * │   hintsUsed: 0,                                                │
 * │                                                                │
 * │   settings: {                  player preferences              │
 * │     bgmVolume: 0.7,                                            │
 * │     sfxVolume: 0.9,                                            │
 * │     muted: false,                                              │
 * │     introSeen: false           skip cinematic on next boot     │
 * │   },                                                           │
 * │                                                                │
 * │   meta: {                                                      │
 * │     createdAt: "...",          ISO timestamp                   │
 * │     updatedAt: "..."                                           │
 * │   }                                                            │
 * │ }                                                              │
 * └────────────────────────────────────────────────────────────────┘
 */

export const CURRENT_SAVE_VERSION = 1;
export const GAME_ID = 'cipher-1892';

/**
 * Default empty save (new player).
 * @returns {object}
 */
export function defaultSave() {
  const now = new Date().toISOString();
  return {
    version: CURRENT_SAVE_VERSION,
    gameId: GAME_ID,

    currentChapter: 'c01',
    currentRoomId: 'apartment',

    completedChapters: [],
    completedRooms: [],

    inventory: [],

    chapterFlags: {},
    globalFlags: {},

    choices: {},

    puzzleAttempts: {},
    firedOnceTriggers: [],
    patternProgress: {},
    hotspotVisibility: {},
    timerRemaining: 0,
    hintsUsed: 0,

    settings: {
      bgmVolume: 0.7,
      sfxVolume: 0.9,
      muted: false,
      introSeen: false
    },

    meta: {
      createdAt: now,
      updatedAt: now
    }
  };
}

/**
 * Validate a save object against the current schema.
 * Permissive on optional fields (returns valid if they're missing —
 * they'll get default values on hydration).
 * Strict on the structural fields: version, gameId, current pointers.
 *
 * @param {object} save
 * @returns {{valid: boolean, errors: string[]}}
 */
export function validateSave(save) {
  const errors = [];

  if (!save || typeof save !== 'object') {
    return { valid: false, errors: ['save is not an object'] };
  }

  if (typeof save.version !== 'number') {
    errors.push('save.version must be a number');
  }

  if (save.gameId !== GAME_ID) {
    errors.push(`save.gameId must be "${GAME_ID}" (got "${save.gameId}")`);
  }

  if (typeof save.currentChapter !== 'string') {
    errors.push('save.currentChapter must be a string');
  }
  if (typeof save.currentRoomId !== 'string') {
    errors.push('save.currentRoomId must be a string');
  }

  if (!Array.isArray(save.completedChapters)) errors.push('completedChapters must be array');
  if (!Array.isArray(save.completedRooms))    errors.push('completedRooms must be array');
  if (!Array.isArray(save.inventory))         errors.push('inventory must be array');

  return { valid: errors.length === 0, errors };
}
