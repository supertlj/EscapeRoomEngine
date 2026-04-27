/**
 * SaveMigrations — version-to-version migration registry.
 *
 * When CURRENT_SAVE_VERSION is bumped (e.g. chapter 2 ships and adds
 * new fields), register a migration here that takes the old shape and
 * returns the new shape. The runner walks the chain.
 *
 * Empty for v1 (initial release). Chapter 2 will add migrations[2].
 *
 * USAGE:
 *   migrations[2] = (saveV1) => ({
 *     ...saveV1,
 *     version: 2,
 *     newFieldFromC2: defaultValue
 *   });
 *
 * Migrations should be PURE: input v(N-1), output v(N). No side effects.
 * Migrations should be ADDITIVE where possible. Never delete fields the
 * old shape relied on.
 */

import { CURRENT_SAVE_VERSION } from './SaveSchema.js';
import { SaveVersionAheadError } from './Errors.js';

/**
 * Registry: { [targetVersion]: (oldSave) => newSave }
 * Migrating to version N takes a save at version (N-1) and produces N.
 */
export const migrations = {
  // Empty for v1. Add migrations[2], migrations[3], ... as schema evolves.
};

/**
 * Walk migrations from save.version up to CURRENT_SAVE_VERSION.
 *
 * @param {object} save — the loaded save data with a `version` field
 * @returns {object} migrated save
 * @throws {SaveVersionAheadError} if save.version > CURRENT_SAVE_VERSION
 * @throws {Error} if a required intermediate migration is missing
 */
export function migrate(save) {
  if (save.version > CURRENT_SAVE_VERSION) {
    throw new SaveVersionAheadError(save.version, CURRENT_SAVE_VERSION);
  }

  let current = save;
  for (let v = save.version + 1; v <= CURRENT_SAVE_VERSION; v++) {
    const fn = migrations[v];
    if (!fn) {
      throw new Error(`Missing migration to version ${v}. SaveMigrations.migrations[${v}] is undefined.`);
    }
    current = fn(current);
    if (current.version !== v) {
      throw new Error(`Migration to v${v} did not set save.version to ${v}`);
    }
  }
  return current;
}
