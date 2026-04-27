/**
 * CinematicPlayer — declarative SVG cinematic sequence runner.
 *
 * Plays a chapter's intro/outro cinematic from a JSON script. Each
 * scene = one background SVG + a list of captions + a duration. The
 * player handles cross-fading scenes, fading captions in/out, and a
 * persistent skip button.
 *
 * SCRIPT SHAPE:
 *   {
 *     "scenes": [
 *       {
 *         "id": "newsroom",
 *         "backgroundAsset": "scenes/intro/01-newsroom.svg",
 *         "duration": 6000,
 *         "captions": [
 *           { "text": "Sam Reyes, 2024.", "delayIn": 1500, "duration": 3500 }
 *         ]
 *       },
 *       ...
 *     ]
 *   }
 *
 * RENDERING:
 *   Stacked <img> elements (one per scene) with opacity transitions.
 *   Captions are absolutely-positioned <div>s with fade animation.
 *
 *   ┌─────────────────────────────────────────┐
 *   │                                         │
 *   │       [scene background SVG]            │
 *   │                                         │
 *   │       Sam Reyes, 2024.                  │ ← caption (fade in/out)
 *   │                                         │
 *   │                              [SKIP] →   │ ← persistent
 *   └─────────────────────────────────────────┘
 *
 * Skip behavior:
 *   - Skip button visible from t=0
 *   - One click → fires onSkip()
 *   - Clicking anywhere else does NOT skip (prevents accidental skips)
 *
 * Asset path resolution:
 *   The script's backgroundAsset paths are relative to the chapter folder.
 *   The caller passes a `resolveAsset(relPath) → absolutePath` function
 *   so this module stays decoupled from ChapterIndex.
 */

export default class CinematicPlayer {
  /**
   * @param {HTMLElement} mountTo
   * @param {object} options
   * @param {function} options.onComplete - called when the last scene finishes
   * @param {function} options.onSkip - called when the user taps SKIP
   * @param {function} options.resolveAsset - (relPath) => absolutePath for asset URLs
   */
  constructor(mountTo, options = {}) {
    this.mountTo = mountTo || document.body;
    this.onComplete = options.onComplete || (() => {});
    this.onSkip = options.onSkip || this.onComplete;
    this.resolveAsset = options.resolveAsset || ((p) => p);

    this.el = null;
    this._sceneEls = [];
    this._timeouts = [];
    this._currentIndex = -1;
    this._completed = false;
    this._injectStyles();
  }

  /**
   * Play a script.
   * @param {object} script - { scenes: [...] }
   */
  play(script) {
    if (!script || !Array.isArray(script.scenes) || script.scenes.length === 0) {
      this._finish();
      return;
    }
    this._build(script);
    this._showScene(0, script);
  }

  _build(script) {
    this.el = document.createElement('div');
    this.el.className = 'cinematic-overlay';

    // Stack of scene <img>s — only one visible at a time via opacity.
    const sceneStack = document.createElement('div');
    sceneStack.className = 'cm-scene-stack';
    for (const scene of script.scenes) {
      const img = document.createElement('img');
      img.className = 'cm-scene';
      img.alt = '';
      img.src = this.resolveAsset(scene.backgroundAsset);
      img.dataset.sceneId = scene.id;
      sceneStack.appendChild(img);
      this._sceneEls.push(img);
    }
    this.el.appendChild(sceneStack);

    // Caption layer (one element per scene, swapped in sync)
    const captionLayer = document.createElement('div');
    captionLayer.className = 'cm-captions';
    this.el.appendChild(captionLayer);
    this._captionLayer = captionLayer;

    // Skip button
    const skipBtn = document.createElement('button');
    skipBtn.className = 'cm-skip';
    skipBtn.textContent = 'Skip ›';
    skipBtn.setAttribute('aria-label', 'Skip cinematic');
    skipBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this._skip();
    });
    this.el.appendChild(skipBtn);

    this.mountTo.appendChild(this.el);
    requestAnimationFrame(() => this.el.classList.add('cm-visible'));
  }

  _showScene(index, script) {
    if (this._completed) return;
    if (index >= script.scenes.length) {
      this._finish();
      return;
    }

    const prevIndex = this._currentIndex;
    this._currentIndex = index;
    const scene = script.scenes[index];

    // Fade out previous scene, fade in current.
    if (prevIndex >= 0) {
      this._sceneEls[prevIndex].classList.remove('cm-scene-active');
    }
    this._sceneEls[index].classList.add('cm-scene-active');

    // Render captions for this scene
    this._renderCaptions(scene.captions || []);

    // Schedule next scene (or finish)
    const t = setTimeout(() => {
      if (this._completed) return;
      if (index === script.scenes.length - 1) {
        this._finish();
      } else {
        this._showScene(index + 1, script);
      }
    }, scene.duration || 5000);
    this._timeouts.push(t);
  }

  _renderCaptions(captions) {
    // Clear existing
    this._captionLayer.innerHTML = '';
    for (const cap of captions) {
      const el = document.createElement('div');
      el.className = 'cm-caption';
      if (cap.style === 'subtle') el.classList.add('cm-caption-subtle');
      if (cap.style === 'large') el.classList.add('cm-caption-large');
      el.textContent = cap.text;
      this._captionLayer.appendChild(el);

      const delayIn = cap.delayIn || 0;
      const dur = cap.duration || 3000;

      const inT = setTimeout(() => el.classList.add('cm-caption-visible'), delayIn);
      const outT = setTimeout(() => el.classList.remove('cm-caption-visible'), delayIn + dur);
      this._timeouts.push(inT, outT);
    }
  }

  _skip() {
    if (this._completed) return;
    this._completed = true;
    this._cleanup();
    this.onSkip();
  }

  _finish() {
    if (this._completed) return;
    this._completed = true;
    this._cleanup();
    this.onComplete();
  }

  _cleanup() {
    for (const t of this._timeouts) clearTimeout(t);
    this._timeouts = [];
    if (this.el) {
      this.el.classList.remove('cm-visible');
      // wait for fade-out before removing
      const removeT = setTimeout(() => {
        if (this.el) {
          this.el.remove();
          this.el = null;
        }
      }, 400);
      // not stored — element removal is fine
    }
  }

  _injectStyles() {
    if (document.getElementById('cinematic-player-styles')) return;
    const style = document.createElement('style');
    style.id = 'cinematic-player-styles';
    style.textContent = `
      .cinematic-overlay {
        position: fixed;
        inset: 0;
        background: #000;
        z-index: 10000;
        opacity: 0;
        transition: opacity 0.4s ease;
        overflow: hidden;
        font-family: var(--font-sans, system-ui, sans-serif);
      }
      .cinematic-overlay.cm-visible { opacity: 1; }

      .cm-scene-stack {
        position: absolute;
        inset: 0;
      }
      .cm-scene {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        opacity: 0;
        transition: opacity 1.1s ease;
      }
      .cm-scene.cm-scene-active {
        opacity: 1;
      }

      .cm-captions {
        position: absolute;
        inset: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 40px 24px;
        pointer-events: none;
      }
      .cm-caption {
        max-width: 640px;
        font-size: 22px;
        font-weight: 300;
        letter-spacing: 1px;
        color: #f0e8d0;
        text-align: center;
        text-shadow: 0 1px 12px rgba(0, 0, 0, 0.75);
        opacity: 0;
        transform: translateY(8px);
        transition: opacity 1.0s ease, transform 1.0s ease;
        margin-bottom: 14px;
      }
      .cm-caption.cm-caption-visible {
        opacity: 1;
        transform: translateY(0);
      }
      .cm-caption-subtle {
        font-size: 14px;
        color: rgba(216, 200, 152, 0.7);
        letter-spacing: 3px;
        text-transform: uppercase;
      }
      .cm-caption-large {
        font-size: 30px;
        font-weight: 400;
        color: #e8d8a8;
      }

      .cm-skip {
        position: absolute;
        top: 18px;
        right: 18px;
        background: rgba(0, 0, 0, 0.45);
        border: 1px solid rgba(196, 163, 90, 0.5);
        color: #c4a35a;
        padding: 8px 16px;
        font-size: 12px;
        letter-spacing: 1.5px;
        border-radius: 4px;
        cursor: pointer;
        text-transform: uppercase;
        font-weight: 600;
        z-index: 2;
        min-height: 36px;
        opacity: 0.7;
        transition: opacity 0.2s, border-color 0.2s, background 0.2s;
      }
      .cm-skip:hover {
        opacity: 1;
        border-color: #c4a35a;
        background: rgba(196, 163, 90, 0.12);
      }
    `;
    document.head.appendChild(style);
  }
}
