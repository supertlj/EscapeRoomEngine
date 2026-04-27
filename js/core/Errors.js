/**
 * Errors — typed error taxonomy for the engine.
 *
 * Every recoverable failure path throws a specific error class so the
 * top-level ErrorBoundary can route it to the right user-facing UI
 * and emit the right telemetry event. No generic Error throws.
 *
 * ┌──────────────────────────────┬──────────────────────────────────────┐
 * │ ERROR                        │ WHEN IT FIRES                        │
 * ├──────────────────────────────┼──────────────────────────────────────┤
 * │ ChapterIndexLoadError        │ Top-level chapter manifest fetch     │
 * │ ChapterManifestParseError    │ A chapter manifest fails parse/valid │
 * │ RoomNotFoundError            │ Unknown room id requested             │
 * │ AssetLoadError               │ SVG asset 404                         │
 * │ SaveCorruptError             │ localStorage save data is malformed  │
 * │ SaveVersionAheadError        │ Save version newer than current build│
 * │ SaveQuotaExceededError       │ localStorage write fails (quota)     │
 * └──────────────────────────────┴──────────────────────────────────────┘
 *
 * Chapter-related errors live in ChapterIndex.js (where they are thrown)
 * and are re-exported here for a single import point.
 */

export {
  ChapterIndexLoadError,
  ChapterManifestParseError,
  RoomNotFoundError
} from './ChapterIndex.js';

export class AssetLoadError extends Error {
  constructor(assetUrl, cause) {
    super(`Failed to load asset: ${assetUrl}`);
    this.name = 'AssetLoadError';
    this.assetUrl = assetUrl;
    this.cause = cause;
  }
}

export class SaveCorruptError extends Error {
  constructor(message, cause) {
    super(message || 'Save data is corrupt');
    this.name = 'SaveCorruptError';
    this.cause = cause;
  }
}

export class SaveVersionAheadError extends Error {
  constructor(saveVersion, currentVersion) {
    super(`Save version ${saveVersion} is newer than current build ${currentVersion}. Please refresh.`);
    this.name = 'SaveVersionAheadError';
    this.saveVersion = saveVersion;
    this.currentVersion = currentVersion;
  }
}

export class SaveQuotaExceededError extends Error {
  constructor(cause) {
    super('Browser storage is full. Clear site data to continue.');
    this.name = 'SaveQuotaExceededError';
    this.cause = cause;
  }
}
