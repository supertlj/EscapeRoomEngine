/**
 * Chapter Manifest — schema + validation
 *
 * A chapter manifest is the self-describing definition of a chapter.
 * Every chapter folder has one. The engine reads it to resolve room
 * paths, BGM tracks, intro/outro cinematics, and completion behavior.
 *
 * Schema versioning: manifests carry `schemaVersion` so future shape
 * changes can be migrated without breaking old chapters.
 *
 * Top-level chapter index lives at `js/data/chapters/manifest.json`
 * and lists every chapter (id, path, order, status).
 *
 * Per-chapter manifest lives at `js/data/chapters/{path}/manifest.json`.
 *
 * SCHEMA (v1):
 * ┌────────────────────────────────────────────────────────────────┐
 * │ {                                                              │
 * │   id: "c01",                  required, string                 │
 * │   title: "Awakening",         required, string                 │
 * │   version: 1,                 required, number (content rev)   │
 * │   schemaVersion: 1,           required, number                 │
 * │   order: 1,                   required, number                 │
 * │   status: "released" |        required                         │
 * │           "coming_soon" |                                      │
 * │           "draft",                                             │
 * │   intro: { ... },             optional                         │
 * │   outro: { ... },             optional                         │
 * │   rooms: [ {                  required, ≥1 entry               │
 * │     id: "apartment",          required, unique within chapter  │
 * │     file: "rooms/...",        required, relative to chapter    │
 * │     isStartRoom: true,        optional, exactly 1 chapter-wide │
 * │     isEndRoom: true           optional                         │
 * │   } ],                                                         │
 * │   audio: {                    optional                         │
 * │     bgm: [ { id, file } ],                                     │
 * │     defaultBgm: "tense"                                        │
 * │   },                                                           │
 * │   unlockRequires: [],         required, array of chapter ids   │
 * │   completion: {               required                         │
 * │     trigger: "endRoomComplete",                                │
 * │     endRoomId: "office",                                       │
 * │     onComplete: [ "..." ]                                      │
 * │   },                                                           │
 * │   kits: [ "woodKit" ]         optional                         │
 * │ }                                                              │
 * └────────────────────────────────────────────────────────────────┘
 */

export const CURRENT_CHAPTER_SCHEMA_VERSION = 1;
export const CURRENT_INDEX_SCHEMA_VERSION = 1;

const REQUIRED_CHAPTER_FIELDS = ['id', 'title', 'version', 'schemaVersion', 'order', 'status', 'rooms', 'unlockRequires', 'completion'];
const VALID_STATUSES = ['released', 'coming_soon', 'draft'];

/**
 * Validate a per-chapter manifest.
 * @param {object} manifest
 * @returns {{valid: boolean, errors: string[]}}
 */
export function validateChapterManifest(manifest) {
  const errors = [];

  if (!manifest || typeof manifest !== 'object') {
    return { valid: false, errors: ['manifest is not an object'] };
  }

  for (const field of REQUIRED_CHAPTER_FIELDS) {
    if (manifest[field] === undefined) {
      errors.push(`missing required field: ${field}`);
    }
  }

  if (manifest.schemaVersion !== undefined && manifest.schemaVersion !== CURRENT_CHAPTER_SCHEMA_VERSION) {
    errors.push(`schemaVersion ${manifest.schemaVersion} does not match current ${CURRENT_CHAPTER_SCHEMA_VERSION}`);
  }

  if (manifest.status !== undefined && !VALID_STATUSES.includes(manifest.status)) {
    errors.push(`status "${manifest.status}" must be one of: ${VALID_STATUSES.join(', ')}`);
  }

  if (Array.isArray(manifest.rooms)) {
    if (manifest.rooms.length === 0) {
      errors.push('rooms must have at least one entry');
    }
    const ids = new Set();
    let startCount = 0;
    for (const room of manifest.rooms) {
      if (!room.id) errors.push('room missing id');
      if (!room.file) errors.push(`room ${room.id || '?'} missing file`);
      if (room.id && ids.has(room.id)) errors.push(`duplicate room id: ${room.id}`);
      if (room.id) ids.add(room.id);
      if (room.isStartRoom) startCount++;
    }
    if (startCount !== 1) {
      errors.push(`exactly one room must have isStartRoom: true (found ${startCount})`);
    }
  } else {
    errors.push('rooms must be an array');
  }

  if (manifest.completion) {
    if (!manifest.completion.trigger) errors.push('completion.trigger required');
    if (manifest.completion.trigger === 'endRoomComplete' && !manifest.completion.endRoomId) {
      errors.push('completion.endRoomId required when trigger is endRoomComplete');
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validate the top-level chapter index manifest.
 * @param {object} indexManifest
 * @returns {{valid: boolean, errors: string[]}}
 */
export function validateIndexManifest(indexManifest) {
  const errors = [];

  if (!indexManifest || typeof indexManifest !== 'object') {
    return { valid: false, errors: ['index manifest is not an object'] };
  }

  if (indexManifest.schemaVersion !== CURRENT_INDEX_SCHEMA_VERSION) {
    errors.push(`schemaVersion ${indexManifest.schemaVersion} does not match current ${CURRENT_INDEX_SCHEMA_VERSION}`);
  }

  if (!Array.isArray(indexManifest.chapters)) {
    errors.push('chapters must be an array');
  } else {
    const ids = new Set();
    for (const ch of indexManifest.chapters) {
      if (!ch.id) errors.push('chapter entry missing id');
      if (!ch.path) errors.push(`chapter ${ch.id || '?'} missing path`);
      if (typeof ch.order !== 'number') errors.push(`chapter ${ch.id || '?'} missing numeric order`);
      if (ch.id && ids.has(ch.id)) errors.push(`duplicate chapter id: ${ch.id}`);
      if (ch.id) ids.add(ch.id);
    }
  }

  return { valid: errors.length === 0, errors };
}
