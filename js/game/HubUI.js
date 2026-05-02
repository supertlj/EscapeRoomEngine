/**
 * HubUI — the home screen.
 *
 * Renders into a container element. Reads from ChapterIndex (for the
 * chapter list) and StateManager (for the save state) to decide what
 * to show:
 *
 *   ┌─────────────────────────────────────┐
 *   │  CIPHER 1892                        │
 *   │  Escape Room Mystery                │
 *   │                                     │
 *   │  ┌───────────────────────────────┐  │
 *   │  │ Continue — Apartment          │  │ ← only if a save exists
 *   │  └───────────────────────────────┘  │
 *   │                                     │
 *   │  [    PLAY    ]   [ NEW GAME ]      │ ← NEW GAME confirms reset
 *   │                                     │
 *   │  Chapters                           │
 *   │  ┌───────────────────────────────┐  │
 *   │  │ Chapter 1: Awakening   ✓      │  │ ← released
 *   │  │ 4 rooms                       │  │
 *   │  └───────────────────────────────┘  │
 *   │  ┌───────────────────────────────┐  │
 *   │  │ Chapter 2: The Trail (soon)   │  │ ← coming_soon
 *   │  │ Coming soon                   │  │
 *   │  └───────────────────────────────┘  │
 *   │                                     │
 *   │  [ Settings ]  [ Reset Save Data ]  │
 *   │  [ Editor (dev) ]  [ Import Room ]  │
 *   └─────────────────────────────────────┘
 */

import { getAllChapters, getGameInfo, getChapterForRoom } from '../core/ChapterIndex.js';
import { GAME_ID } from '../core/SaveSchema.js';
import { t, listLocales, getActiveLocale } from '../core/I18n.js';

export default class HubUI {
  /**
   * @param {HTMLElement} container - target element to render into
   * @param {object} options
   * @param {function} options.onPlay - called when player clicks PLAY
   * @param {function} options.onNewGame - called when player confirms new game
   */
  constructor(container, options = {}) {
    this.container = container;
    this.onPlay = options.onPlay || (() => { window.location.href = 'play.html'; });
    this.onNewGame = options.onNewGame || (() => {
      localStorage.removeItem(`ere_save_${GAME_ID}`);
      window.location.href = 'play.html';
    });
  }

  render() {
    const game = getGameInfo();
    const chapters = getAllChapters();
    const save = this._readSave();
    const hasSave = save !== null;

    // Title pulls from i18n (subtitle localized; title is a brand name kept as-is)
    const titleHtml = `
      <h1>${t('game.title')}</h1>
      <p class="subtitle">${t('game.subtitle')}</p>
    `;

    const continueHtml = hasSave
      ? this._renderContinueCard(save)
      : '';

    const primaryButtonsHtml = hasSave
      ? `
        <button class="menu-btn primary" id="hub-play">${t('hub.continue')}</button>
        <button class="menu-btn secondary" id="hub-newgame">${t('hub.newGame')}</button>
      `
      : `<button class="menu-btn primary" id="hub-play">${t('hub.playFresh')}</button>`;

    const chaptersHtml = chapters.map(ch => this._renderChapterCard(ch, save)).join('');

    this.container.innerHTML = `
      <div class="home">
        ${titleHtml}

        ${continueHtml}

        <div class="hub-actions">
          ${primaryButtonsHtml}
        </div>

        <div class="hub-section-label">${t('hub.chapterListLabel')}</div>
        <div class="room-list">
          ${chaptersHtml}
        </div>

        <div class="hub-footer">
          <button class="menu-btn secondary" id="hub-reset" ${hasSave ? '' : 'disabled'}>
            ${t('hub.resetSaveData')}
          </button>
          <a href="editor.html"><button class="menu-btn secondary">${t('hub.editorDev')}</button></a>
          <label class="menu-btn secondary" style="cursor:pointer;">
            ${t('hub.importRoomJson')}
            <input type="file" accept=".json" id="importFile" style="display:none;">
          </label>
          <label class="menu-btn secondary hub-language" for="hub-language-select">
            <span class="hub-language-label">${t('hub.language')}</span>
            <select id="hub-language-select" class="hub-language-select" aria-label="${t('hub.language')}">
              ${listLocales().map(loc => `
                <option value="${loc.code}" ${loc.code === getActiveLocale() ? 'selected' : ''}>
                  ${loc.nativeName}
                </option>
              `).join('')}
            </select>
          </label>
        </div>
      </div>
    `;

    this._wireEvents();
  }

  _readSave() {
    const raw = localStorage.getItem(`ere_save_${GAME_ID}`);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  _renderContinueCard(save) {
    const chapter = save.currentChapter ? this._chapterById(save.currentChapter) : null;
    // Chapter title resolves through i18n (e.g. "Awakening" / "苏醒")
    const chapterTitle = chapter ? t(`chapters.${chapter.id}.title`) : '';
    const roomLabel = save.currentRoomId || '?';
    const roomDisplay = t(`rooms.${roomLabel}.name`);
    // If no translation found, t() returns the key — use a friendly fallback.
    const roomFinal = roomDisplay.startsWith('rooms.') ? this._titleCase(roomLabel) : roomDisplay;
    const titleLine = chapter
      ? `Ch. ${chapter.order}: ${chapterTitle}`
      : chapterTitle;
    return `
      <div class="continue-card">
        <div class="continue-meta">${t('hub.continueLabel')}</div>
        <div class="continue-title">${titleLine}</div>
        <div class="continue-room">${t('hub.continueRoomLine', { room: roomFinal })}</div>
      </div>
    `;
  }

  _renderChapterCard(chapter, save) {
    const isReleased = chapter._indexStatus === 'released';
    const isComingSoon = chapter._indexStatus === 'coming_soon';
    const isComplete = save && Array.isArray(save.completedChapters) && save.completedChapters.includes(chapter.id);
    const roomCount = chapter.rooms?.length || 0;
    const localizedTitle = t(`chapters.${chapter.id}.title`);
    const titleFinal = localizedTitle.startsWith('chapters.') ? chapter.title : localizedTitle;

    let badge = '';
    if (isComplete) badge = `<span class="badge complete">${t('hub.badgeComplete')}</span>`;
    else if (isComingSoon) badge = `<span class="badge soon">${t('hub.badgeComingSoon')}</span>`;
    else if (isReleased) badge = `<span class="badge released">${t('hub.badgeAvailable')}</span>`;

    const meta = isComingSoon
      ? t('hub.chapterCardInDevelopment')
      : (roomCount === 1
          ? t('hub.chapterCardRoomCountSingular')
          : t('hub.chapterCardRoomCount', { count: roomCount }));

    return `
      <div class="room-card ${isComingSoon ? 'disabled' : ''}">
        <div>
          <div class="name">${t('hub.chapterCardTitle', { order: chapter.order, title: titleFinal })} ${badge}</div>
          <div class="meta">${meta}</div>
        </div>
      </div>
    `;
  }

  _chapterById(id) {
    return getAllChapters().find(c => c.id === id) || null;
  }

  _titleCase(s) {
    return s.replace(/(^|[\s_-])\w/g, m => m.toUpperCase()).replace(/[_-]/g, ' ');
  }

  _wireEvents() {
    const playBtn = this.container.querySelector('#hub-play');
    if (playBtn) playBtn.addEventListener('click', () => this.onPlay());

    const newGameBtn = this.container.querySelector('#hub-newgame');
    if (newGameBtn) {
      newGameBtn.addEventListener('click', () => {
        if (confirm(t('hub.newGameConfirm'))) {
          this.onNewGame();
        }
      });
    }

    const resetBtn = this.container.querySelector('#hub-reset');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (confirm(t('hub.resetSaveConfirm'))) {
          localStorage.removeItem(`ere_save_${GAME_ID}`);
          this.render();
        }
      });
    }

    const langSelect = this.container.querySelector('#hub-language-select');
    if (langSelect) {
      langSelect.addEventListener('change', (e) => {
        const code = e.target.value;
        // Persist into the save (creating one if none exists yet) so the
        // choice survives across sessions and play.html boot picks it up.
        const key = `ere_save_${GAME_ID}`;
        let blob;
        try {
          const raw = localStorage.getItem(key);
          blob = raw ? JSON.parse(raw) : null;
        } catch { blob = null; }
        if (!blob) {
          // No save yet — write a minimal blob with just the locale set.
          // play.html will fully hydrate / overwrite on first launch.
          blob = {
            version: 1, gameId: GAME_ID,
            currentChapter: 'c01', currentRoomId: 'apartment',
            completedChapters: [], completedRooms: [], inventory: [],
            chapterFlags: {}, globalFlags: {}, choices: {},
            puzzleAttempts: {}, firedOnceTriggers: [], patternProgress: {}, hotspotVisibility: {},
            timerRemaining: 0, hintsUsed: 0,
            settings: { bgmVolume: 0.7, sfxVolume: 0.9, muted: false, introSeen: false, locale: code },
            meta: { createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
          };
        } else {
          blob.settings = { ...(blob.settings || {}), locale: code };
        }
        localStorage.setItem(key, JSON.stringify(blob));
        // Reload — i18n boots fresh and re-renders everything in the new locale.
        location.reload();
      });
    }

    const importFile = this.container.querySelector('#importFile');
    if (importFile) {
      importFile.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
          try {
            JSON.parse(reader.result);
            localStorage.setItem('ere_imported_room', reader.result);
            window.location.href = 'play.html#room=imported';
          } catch (err) {
            alert(t('hub.importInvalidJson', { message: err.message }));
          }
        };
        reader.readAsText(file);
      });
    }
  }
}
