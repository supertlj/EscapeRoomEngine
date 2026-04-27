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

    const titleHtml = `
      <h1>${game?.title || 'Cipher 1892'}</h1>
      <p class="subtitle">${game?.subtitle || 'Escape Room Mystery'}</p>
    `;

    const continueHtml = hasSave
      ? this._renderContinueCard(save)
      : '';

    const primaryButtonsHtml = hasSave
      ? `
        <button class="menu-btn primary" id="hub-play">CONTINUE</button>
        <button class="menu-btn secondary" id="hub-newgame">New Game</button>
      `
      : `<button class="menu-btn primary" id="hub-play">PLAY</button>`;

    const chaptersHtml = chapters.map(ch => this._renderChapterCard(ch, save)).join('');

    this.container.innerHTML = `
      <div class="home">
        ${titleHtml}

        ${continueHtml}

        <div class="hub-actions">
          ${primaryButtonsHtml}
        </div>

        <div class="hub-section-label">Chapters</div>
        <div class="room-list">
          ${chaptersHtml}
        </div>

        <div class="hub-footer">
          <button class="menu-btn secondary" id="hub-reset" ${hasSave ? '' : 'disabled'}>
            Reset Save Data
          </button>
          <a href="editor.html"><button class="menu-btn secondary">Editor (dev)</button></a>
          <label class="menu-btn secondary" style="cursor:pointer;">
            Import Room (JSON)
            <input type="file" accept=".json" id="importFile" style="display:none;">
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
    const chapterTitle = chapter ? chapter.title : 'Unknown Chapter';
    const roomLabel = save.currentRoomId || '?';
    return `
      <div class="continue-card">
        <div class="continue-meta">Continue</div>
        <div class="continue-title">${chapter ? `Ch. ${chapter.order}: ${chapterTitle}` : chapterTitle}</div>
        <div class="continue-room">Room: ${this._titleCase(roomLabel)}</div>
      </div>
    `;
  }

  _renderChapterCard(chapter, save) {
    const isReleased = chapter._indexStatus === 'released';
    const isComingSoon = chapter._indexStatus === 'coming_soon';
    const isComplete = save && Array.isArray(save.completedChapters) && save.completedChapters.includes(chapter.id);
    const roomCount = chapter.rooms?.length || 0;

    let badge = '';
    if (isComplete) badge = '<span class="badge complete">✓ Complete</span>';
    else if (isComingSoon) badge = '<span class="badge soon">Coming soon</span>';
    else if (isReleased) badge = '<span class="badge released">Available</span>';

    const meta = isComingSoon
      ? '— in development —'
      : `${roomCount} room${roomCount === 1 ? '' : 's'}`;

    return `
      <div class="room-card ${isComingSoon ? 'disabled' : ''}">
        <div>
          <div class="name">Chapter ${chapter.order}: ${chapter.title} ${badge}</div>
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
        if (confirm('Start a new game? Your current progress will be lost.')) {
          this.onNewGame();
        }
      });
    }

    const resetBtn = this.container.querySelector('#hub-reset');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (confirm('Reset all save data? This cannot be undone.')) {
          localStorage.removeItem(`ere_save_${GAME_ID}`);
          this.render();
        }
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
            alert('Invalid JSON file: ' + err.message);
          }
        };
        reader.readAsText(file);
      });
    }
  }
}
