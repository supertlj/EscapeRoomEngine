/**
 * ChapterIndex — single source of truth for chapter + room path resolution.
 *
 * Engine, play.html, and any future consumer call into this module
 * instead of building paths inline. Replaces the old flat-path scheme
 * (`js/data/{roomId}.json`).
 *
 * BOOT FLOW:
 * ┌─────────────────────────────────────────────────────────────┐
 * │  buildIndex()                                               │
 * │     │                                                       │
 * │     ├─▶ fetch js/data/chapters/manifest.json (top-level)    │
 * │     │                                                       │
 * │     ├─▶ for each chapter entry:                             │
 * │     │     fetch js/data/chapters/{path}/manifest.json       │
 * │     │     validate per-chapter manifest                     │
 * │     │     populate roomToChapter[roomId] = { ... }          │
 * │     │                                                       │
 * │     └─▶ ready: resolveRoomPath() / getAllChapters() / etc.  │
 * └─────────────────────────────────────────────────────────────┘
 *
 * resolveRoomPath('apartment') →
 *   'js/data/chapters/c01-awakening/rooms/apartment.json'
 *
 * Throws ChapterIndexLoadError on fetch/parse failure.
 * Throws RoomNotFoundError when an unknown roomId is requested.
 */

import {
  validateChapterManifest,
  validateIndexManifest
} from './ChapterManifest.js';

const BASE_PATH = 'js/data/chapters';
const INDEX_PATH = `${BASE_PATH}/manifest.json`;

let _index = null;             // top-level index manifest
let _chapters = new Map();     // chapter id -> per-chapter manifest
let _roomToChapter = new Map(); // room id -> { chapterId, chapterPath, file }
let _ready = false;

export class ChapterIndexLoadError extends Error {
  constructor(message, cause) {
    super(message);
    this.name = 'ChapterIndexLoadError';
    this.cause = cause;
  }
}

export class ChapterManifestParseError extends Error {
  constructor(message, cause) {
    super(message);
    this.name = 'ChapterManifestParseError';
    this.cause = cause;
  }
}

export class RoomNotFoundError extends Error {
  constructor(roomId) {
    super(`Unknown room: ${roomId}`);
    this.name = 'RoomNotFoundError';
    this.roomId = roomId;
  }
}

/**
 * Build the in-memory index by fetching all chapter manifests.
 * Must be called once at boot before any path resolution.
 * Idempotent — safe to call multiple times.
 */
export async function buildIndex() {
  if (_ready) return;

  // 1. Fetch top-level index
  let indexResp;
  try {
    indexResp = await fetch(INDEX_PATH);
    if (!indexResp.ok) {
      throw new ChapterIndexLoadError(`HTTP ${indexResp.status} fetching ${INDEX_PATH}`);
    }
  } catch (err) {
    throw new ChapterIndexLoadError(`Failed to fetch top-level chapter index`, err);
  }

  let indexData;
  try {
    indexData = await indexResp.json();
  } catch (err) {
    throw new ChapterManifestParseError(`Top-level index manifest is malformed JSON`, err);
  }

  const indexValidation = validateIndexManifest(indexData);
  if (!indexValidation.valid) {
    throw new ChapterManifestParseError(
      `Top-level index manifest invalid: ${indexValidation.errors.join('; ')}`
    );
  }

  _index = indexData;
  _chapters.clear();
  _roomToChapter.clear();

  // 2. Fetch each per-chapter manifest (released chapters only;
  //    coming_soon / draft entries are kept as index-only stubs so
  //    HubUI can show them without their content existing yet).
  for (const entry of indexData.chapters) {
    if (entry.status !== 'released') {
      // Stub record — no rooms, no manifest fetched.
      _chapters.set(entry.id, {
        id: entry.id,
        title: _placeholderTitleFor(entry.id),
        order: entry.order,
        status: entry.status,
        rooms: [],
        _path: entry.path,
        _indexOrder: entry.order,
        _indexStatus: entry.status
      });
      continue;
    }

    const manifestPath = `${BASE_PATH}/${entry.path}/manifest.json`;
    let chResp;
    try {
      chResp = await fetch(manifestPath);
      if (!chResp.ok) {
        throw new ChapterIndexLoadError(`HTTP ${chResp.status} fetching ${manifestPath}`);
      }
    } catch (err) {
      throw new ChapterIndexLoadError(`Failed to fetch chapter manifest: ${entry.id}`, err);
    }

    let chData;
    try {
      chData = await chResp.json();
    } catch (err) {
      throw new ChapterManifestParseError(`Chapter ${entry.id} manifest is malformed JSON`, err);
    }

    const chValidation = validateChapterManifest(chData);
    if (!chValidation.valid) {
      throw new ChapterManifestParseError(
        `Chapter ${entry.id} manifest invalid: ${chValidation.errors.join('; ')}`
      );
    }

    const chapterRecord = {
      ...chData,
      _path: entry.path,
      _indexOrder: entry.order,
      _indexStatus: entry.status
    };
    _chapters.set(chData.id, chapterRecord);

    for (const room of chData.rooms) {
      _roomToChapter.set(room.id, {
        chapterId: chData.id,
        chapterPath: entry.path,
        file: room.file
      });
    }
  }

  _ready = true;
}

/**
 * Resolve a room id to its on-disk path.
 * @param {string} roomId — manifest-level room id (e.g. "apartment")
 * @returns {string} path relative to web root
 * @throws {RoomNotFoundError} if roomId is not in any chapter
 */
export function resolveRoomPath(roomId) {
  if (!_ready) {
    throw new Error('ChapterIndex not built. Call buildIndex() first.');
  }
  const ref = _roomToChapter.get(roomId);
  if (!ref) {
    throw new RoomNotFoundError(roomId);
  }
  return `${BASE_PATH}/${ref.chapterPath}/${ref.file}`;
}

/**
 * Resolve an asset path within a chapter (used for cinematic assets, audio, etc).
 * @param {string} chapterId
 * @param {string} relPath — path relative to chapter folder
 * @returns {string} path relative to web root
 */
export function resolveChapterAssetPath(chapterId, relPath) {
  if (!_ready) {
    throw new Error('ChapterIndex not built. Call buildIndex() first.');
  }
  const chapter = _chapters.get(chapterId);
  if (!chapter) {
    throw new Error(`Unknown chapter: ${chapterId}`);
  }
  return `${BASE_PATH}/${chapter._path}/${relPath}`;
}

/**
 * Get all chapters in order. Used by HubUI.
 * @returns {Array<object>}
 */
export function getAllChapters() {
  if (!_ready) return [];
  return Array.from(_chapters.values()).sort((a, b) => a._indexOrder - b._indexOrder);
}

/**
 * Get a single chapter by id.
 * @param {string} chapterId
 * @returns {object | null}
 */
export function getChapter(chapterId) {
  if (!_ready) return null;
  return _chapters.get(chapterId) || null;
}

/**
 * Get the chapter that contains a given room.
 * @param {string} roomId
 * @returns {object | null}
 */
export function getChapterForRoom(roomId) {
  if (!_ready) return null;
  const ref = _roomToChapter.get(roomId);
  return ref ? _chapters.get(ref.chapterId) : null;
}

/**
 * Game-level metadata (title, subtitle).
 */
export function getGameInfo() {
  return _index ? _index.game : null;
}

/**
 * Friendly placeholder title for a coming-soon chapter when its
 * manifest hasn't been authored yet. Maps "c02-the-trail" → "The Trail".
 */
function _placeholderTitleFor(chapterId) {
  const titles = {
    c02: 'The Trail',
    c03: 'Going Underground',
    c04: 'Striking Back',
    c05: 'The Vault'
  };
  return titles[chapterId] || chapterId.toUpperCase();
}

/**
 * Test/internal: reset the cache so a fresh boot can be exercised.
 */
export function _resetForTests() {
  _index = null;
  _chapters.clear();
  _roomToChapter.clear();
  _ready = false;
}
