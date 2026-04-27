/**
 * EndScreen — chapter outro overlay.
 *
 * Renders a full-viewport overlay when a chapter's end room is
 * completed. For Chapter 1, this is the placeholder slot where
 * the Marcus eye-track cinematic will live (built in Week 4 polish).
 *
 * v1 wireframe — text-only. The actual cinematic SVG sequence will
 * be authored later as `chapters/c01-awakening/outro.json` per the
 * chapter manifest's `outro.asset` field.
 *
 * Layout:
 *   ┌──────────────────────────────────────────────┐
 *   │                                              │
 *   │              He's alive.                     │  ← cliffhanger text
 *   │       And he's not on your side.             │
 *   │                                              │
 *   │       ─────────────────────                  │
 *   │       CHAPTER 2 — THE TRAIL                  │  ← next chapter teaser
 *   │       Coming soon                            │
 *   │                                              │
 *   │   [ Replay Chapter ]   [ Back to Hub ]       │
 *   │                                              │
 *   └──────────────────────────────────────────────┘
 *
 * The screen is private-alpha shape — no email capture, no share, no
 * tip jar. Those CTAs are deferred until the mobile public launch.
 */

export default class EndScreen {
  /**
   * @param {HTMLElement} mountTo — element to attach the overlay to (typically document.body)
   * @param {object} options
   * @param {function} options.onReplay — called when "Replay Chapter" tapped
   * @param {function} options.onBackToHub — called when "Back to Hub" tapped
   * @param {object} options.chapter — chapter manifest record (for title)
   */
  constructor(mountTo, options = {}) {
    this.mountTo = mountTo || document.body;
    this.onReplay = options.onReplay || (() => location.reload());
    this.onBackToHub = options.onBackToHub || (() => { window.location.href = 'index.html'; });
    this.chapter = options.chapter || null;
    this.el = null;
    this._injectStyles();
  }

  /**
   * Show the end screen for a chapter.
   * @param {object} chapter — chapter manifest record (overrides constructor option)
   * @param {object} nextChapter — optional, the chapter after this one (for teaser)
   */
  show(chapter = this.chapter, nextChapter = null) {
    if (this.el) this.dismiss();

    const chapterLabel = chapter
      ? `Chapter ${chapter.order}: ${chapter.title}`
      : 'Chapter Complete';

    const teaserHtml = nextChapter
      ? `
        <div class="es-divider"></div>
        <div class="es-teaser-label">CHAPTER ${nextChapter.order} — ${nextChapter.title.toUpperCase()}</div>
        <div class="es-teaser-status">${nextChapter._indexStatus === 'released' ? 'Available now' : 'Coming soon'}</div>
      `
      : `
        <div class="es-divider"></div>
        <div class="es-teaser-label">MORE TO COME</div>
        <div class="es-teaser-status">Chapter 2 in development</div>
      `;

    this.el = document.createElement('div');
    this.el.className = 'end-screen-overlay';
    this.el.innerHTML = `
      <div class="es-content">
        <div class="es-chapter-tag">${chapterLabel} — Complete</div>

        <div class="es-cliffhanger">
          <div class="es-line es-line-1">He's alive.</div>
          <div class="es-line es-line-2">And he's not on your side.</div>
        </div>

        ${teaserHtml}

        <div class="es-actions">
          <button class="es-btn es-btn-secondary" id="es-replay">Replay Chapter</button>
          <button class="es-btn es-btn-primary" id="es-hub">Back to Hub</button>
        </div>

        <div class="es-footer-note">
          <em>(Cinematic outro placeholder — Marcus eye-track shot ships in Week 4 polish.)</em>
        </div>
      </div>
    `;

    this.mountTo.appendChild(this.el);

    // Wire buttons
    this.el.querySelector('#es-replay').addEventListener('click', () => {
      this.dismiss();
      this.onReplay();
    });
    this.el.querySelector('#es-hub').addEventListener('click', () => {
      this.dismiss();
      this.onBackToHub();
    });

    // Trigger fade-in next tick
    requestAnimationFrame(() => this.el.classList.add('es-visible'));
  }

  dismiss() {
    if (!this.el) return;
    this.el.remove();
    this.el = null;
  }

  isVisible() {
    return this.el !== null;
  }

  _injectStyles() {
    if (document.getElementById('end-screen-styles')) return;
    const style = document.createElement('style');
    style.id = 'end-screen-styles';
    style.textContent = `
      .end-screen-overlay {
        position: fixed;
        inset: 0;
        background: #060608;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        opacity: 0;
        transition: opacity 0.6s ease;
        padding: 40px 20px;
        text-align: center;
        font-family: var(--font-sans, system-ui, sans-serif);
      }
      .end-screen-overlay.es-visible { opacity: 1; }

      .es-content {
        max-width: 520px;
        width: 100%;
        color: #d8c898;
      }

      .es-chapter-tag {
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 3px;
        color: rgba(196, 163, 90, 0.6);
        margin-bottom: 48px;
      }

      .es-cliffhanger {
        margin-bottom: 32px;
      }
      .es-line {
        font-size: 28px;
        font-weight: 300;
        letter-spacing: 1px;
        color: #e8d8a8;
        margin: 0;
        line-height: 1.4;
        opacity: 0;
        transform: translateY(8px);
        animation: es-line-fade 1.2s ease forwards;
      }
      .es-line-1 { animation-delay: 0.3s; }
      .es-line-2 { animation-delay: 1.6s; font-style: italic; }
      @keyframes es-line-fade {
        to { opacity: 1; transform: translateY(0); }
      }

      .es-divider {
        width: 80px;
        height: 1px;
        background: rgba(196, 163, 90, 0.3);
        margin: 28px auto;
      }

      .es-teaser-label {
        font-size: 13px;
        font-weight: 600;
        letter-spacing: 3px;
        color: #c4a35a;
        margin-bottom: 4px;
      }
      .es-teaser-status {
        font-size: 12px;
        color: rgba(216, 200, 152, 0.5);
        font-style: italic;
        margin-bottom: 36px;
      }

      .es-actions {
        display: flex;
        gap: 12px;
        justify-content: center;
        flex-wrap: wrap;
      }
      .es-btn {
        padding: 12px 22px;
        border-radius: 6px;
        font-size: 13px;
        font-weight: 600;
        letter-spacing: 1px;
        cursor: pointer;
        min-height: 44px;
        min-width: 140px;
      }
      .es-btn-primary {
        background: #c4a35a;
        color: #1a1410;
        border: 1px solid #c4a35a;
      }
      .es-btn-secondary {
        background: transparent;
        color: #c4a35a;
        border: 1px solid rgba(196, 163, 90, 0.5);
      }
      .es-btn-primary:hover { background: #d8b772; }
      .es-btn-secondary:hover { border-color: #c4a35a; }

      .es-footer-note {
        margin-top: 32px;
        font-size: 10px;
        color: rgba(216, 200, 152, 0.25);
        letter-spacing: 0.5px;
      }
    `;
    document.head.appendChild(style);
  }
}
