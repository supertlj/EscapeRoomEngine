/**
 * I18n — translation lookup + locale management.
 *
 * Single t() function used by every UI module. Strings live in
 * js/data/i18n/{locale}.json. Locale is loaded once at boot before
 * any UI renders.
 *
 * KEY STRUCTURE (dot-namespaced):
 *   t('hub.play')                       → "PLAY"
 *   t('rooms.apartment.name')            → "The Apartment"
 *   t('rooms.apartment.hotspots.hs_plant') → "Potted Plant"
 *   t('cinematic.intro.scenes.1.captions.0') → "Eighteen months undercover."
 *
 * Missing keys fall back gracefully:
 *   1. Try the active locale.
 *   2. Try the fallback locale (English).
 *   3. Return the key itself (visible bug → easy to spot).
 *
 * INTERPOLATION:
 *   t('continueCard.roomLine', { room: 'Apartment' })
 *     where the JSON has "Room: {room}"
 *
 * LOCALE DETECTION:
 *   buildLocale(savedLocale) honors:
 *     1. Explicit savedLocale (from save data) if available
 *     2. navigator.language (e.g. "zh-CN", "en-US") matched against
 *        registered locales — exact, then language-prefix
 *     3. Falls back to FALLBACK_LOCALE
 */

const FALLBACK_LOCALE = 'en';
const I18N_BASE = 'js/data/i18n';

let _activeLocale = FALLBACK_LOCALE;
let _activeStrings = {};
let _fallbackStrings = {};
let _registry = null;
let _ready = false;

/**
 * Load the locale registry + active and fallback locale data.
 * @param {string} [preferredLocale] — saved-state locale, optional
 */
export async function buildLocale(preferredLocale) {
  // 1. Load registry of available locales
  if (!_registry) {
    const r = await fetch(`${I18N_BASE}/index.json`);
    if (!r.ok) throw new Error(`I18n registry fetch failed: HTTP ${r.status}`);
    _registry = await r.json();
  }

  // 2. Load fallback (English) once and keep cached
  if (!_fallbackStrings || Object.keys(_fallbackStrings).length === 0) {
    _fallbackStrings = await _fetchLocale(FALLBACK_LOCALE);
  }

  // 3. Pick active locale
  const target = _resolveLocale(preferredLocale);
  if (target === FALLBACK_LOCALE) {
    _activeStrings = _fallbackStrings;
  } else {
    try {
      _activeStrings = await _fetchLocale(target);
    } catch (err) {
      console.warn(`I18n: failed to load ${target}, falling back to ${FALLBACK_LOCALE}`, err);
      _activeStrings = _fallbackStrings;
      _activeLocale = FALLBACK_LOCALE;
      _ready = true;
      return _activeLocale;
    }
  }
  _activeLocale = target;
  _ready = true;
  return _activeLocale;
}

/**
 * Translate a key.
 * @param {string} key — dot-path
 * @param {object} [params] — interpolation values
 * @returns {string} translated string, or the key itself if missing
 */
export function t(key, params) {
  if (!_ready) return key;
  const value = _lookup(_activeStrings, key) ?? _lookup(_fallbackStrings, key);
  if (value === undefined || value === null) {
    if (typeof console !== 'undefined' && console.warn) {
      console.warn(`I18n: missing key "${key}" (locale=${_activeLocale})`);
    }
    return key;
  }
  if (typeof value !== 'string') return value;
  if (!params) return value;
  return value.replace(/\{(\w+)\}/g, (m, name) =>
    name in params ? String(params[name]) : m
  );
}

/**
 * Look up a key without translation (used for arrays of strings,
 * e.g. hint lists, cinematic captions).
 */
export function tRaw(key) {
  if (!_ready) return undefined;
  return _lookup(_activeStrings, key) ?? _lookup(_fallbackStrings, key);
}

export function getActiveLocale() { return _activeLocale; }
export function isReady() { return _ready; }
export function listLocales() { return _registry?.locales || []; }

/** For tests only. */
export function _resetForTests() {
  _activeLocale = FALLBACK_LOCALE;
  _activeStrings = {};
  _fallbackStrings = {};
  _registry = null;
  _ready = false;
}

// --- internals ---

async function _fetchLocale(locale) {
  const r = await fetch(`${I18N_BASE}/${locale}.json`);
  if (!r.ok) throw new Error(`I18n locale fetch failed: HTTP ${r.status} for ${locale}`);
  return r.json();
}

function _resolveLocale(preferred) {
  const known = (_registry?.locales || []).map(l => l.code);
  // 1. Explicit preference
  if (preferred && known.includes(preferred)) return preferred;
  // 2. Browser language
  if (typeof navigator !== 'undefined' && navigator.language) {
    const navLang = navigator.language;
    if (known.includes(navLang)) return navLang;
    // language-prefix match (e.g. "zh-TW" → match "zh-CN" if no exact)
    const prefix = navLang.split('-')[0];
    const prefixHit = known.find(k => k.split('-')[0] === prefix);
    if (prefixHit) return prefixHit;
  }
  return FALLBACK_LOCALE;
}

function _lookup(obj, key) {
  if (!obj) return undefined;
  const parts = key.split('.');
  let cur = obj;
  for (const p of parts) {
    if (cur == null || typeof cur !== 'object') return undefined;
    cur = cur[p];
  }
  return cur;
}
