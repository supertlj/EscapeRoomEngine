import EventBus from '../core/EventBus.js';

/**
 * Zoom/close-up view with interactive animated sub-hotspots.
 *
 * Data model on a hotspot:
 *   zoomView: {
 *     image: "data:image/svg+xml;base64,...",
 *     subHotspots: [{
 *       id, label, bounds: {x,y,w,h} (percentage 0-100),
 *       image, imageOpen,              // closed/open state images
 *       visibleWhen: [],               // flags required to show
 *       hideOnCollect: true,           // hide after item pickup
 *       animation: {                   // optional animation on click
 *         type: "rotate"|"slide-down"|"slide-right"|"swing"|"fade-in"|"scale-pop",
 *         to: "90deg"|"30%",           // target value
 *       },
 *       triggers: [...]                // same format as hotspot triggers
 *     }]
 *   }
 */
export default class ZoomViewUI {
  constructor(container, state) {
    this.container = container;
    this.state = state;
    this._inventoryUI = null;
    this._open = false;
    this._currentHotspot = null;
    this._subEls = [];
    this._activatedSubs = new Set();

    this._createElement();

    EventBus.on('action:openZoom', (data) => this.open(data.hotspot));
    EventBus.on('state:flagChanged', () => this._updateSubVisibility());
  }

  /** Link inventory so useItem triggers work in zoom */
  setInventoryUI(inventoryUI) {
    this._inventoryUI = inventoryUI;
  }

  _createElement() {
    this.overlay = document.createElement('div');
    this.overlay.className = 'zoom-overlay hidden';
    this.overlay.innerHTML = `
      <div class="zoom-viewport">
        <div class="zoom-scene">
          <img class="zoom-bg" alt="" />
        </div>
        <button class="zoom-close">\u00d7</button>
      </div>
    `;
    this.container.appendChild(this.overlay);

    this.viewport = this.overlay.querySelector('.zoom-viewport');
    this.scene = this.overlay.querySelector('.zoom-scene');
    this.bgImg = this.overlay.querySelector('.zoom-bg');
    this.closeBtn = this.overlay.querySelector('.zoom-close');

    this.closeBtn.addEventListener('click', () => this.close());
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) this.close();
    });
  }

  open(hotspot) {
    if (!hotspot || !hotspot.zoomView) return;
    this._currentHotspot = hotspot;
    this._open = true;

    const zv = hotspot.zoomView;
    this.bgImg.src = zv.image || '';
    this._buildSubs(zv.subHotspots || []);
    this.overlay.classList.remove('hidden');

    requestAnimationFrame(() => {
      this.overlay.classList.add('active');
    });
  }

  close() {
    this.overlay.classList.remove('active');
    setTimeout(() => {
      this.overlay.classList.add('hidden');
      this._clearSubs();
      this._currentHotspot = null;
      this._open = false;
      EventBus.emit('zoom:closed', {});
    }, 250);
  }

  isOpen() { return this._open; }

  /* ---- Sub-hotspot rendering ---- */

  _buildSubs(subs) {
    this._clearSubs();
    for (const sub of subs) {
      const el = document.createElement('div');
      el.className = 'zoom-sub';
      el.dataset.subId = sub.id;

      // Position (percentage-based)
      el.style.left   = sub.bounds.x + '%';
      el.style.top    = sub.bounds.y + '%';
      el.style.width  = sub.bounds.w + '%';
      el.style.height = sub.bounds.h + '%';

      // Animation data attributes
      if (sub.animation) {
        el.dataset.anim = sub.animation.type;
        if (sub.animation.to) {
          if (sub.animation.type === 'rotate' || sub.animation.type === 'swing') {
            el.style.setProperty('--rotate-to', sub.animation.to);
          } else if (sub.animation.type.startsWith('slide')) {
            el.style.setProperty('--slide-to', sub.animation.to);
          }
        }
      }

      // Restore activated state from flags
      if (this.state.getFlag('_zoomAnim_' + sub.id)) {
        el.classList.add('activated');
        this._activatedSubs.add(sub.id);
      }

      // Image
      const imgSrc = (this._activatedSubs.has(sub.id) && sub.imageOpen)
        ? sub.imageOpen : sub.image;
      if (imgSrc) {
        const img = document.createElement('img');
        img.src = imgSrc;
        img.alt = sub.label || '';
        img.draggable = false;
        el.appendChild(img);
      }

      // Visibility
      const visible = this._isSubVisible(sub);
      if (!visible) el.classList.add('hidden');

      // Shimmer for discoverable collectibles
      if (sub.image && visible && sub.hideOnCollect) {
        el.classList.add('discoverable');
      }

      el.addEventListener('click', (e) => {
        e.stopPropagation();
        this._onSubClick(sub, el);
      });

      this.scene.appendChild(el);
      this._subEls.push({ el, sub });
    }
  }

  _clearSubs() {
    for (const { el } of this._subEls) el.remove();
    this._subEls = [];
  }

  _isSubVisible(sub) {
    if (this.state.getFlag('_zoomHidden_' + sub.id)) return false;
    if (sub.visibleWhen && sub.visibleWhen.length > 0) {
      return this.state.checkFlags(sub.visibleWhen);
    }
    return true;
  }

  _updateSubVisibility() {
    for (const { el, sub } of this._subEls) {
      const wasHidden = el.classList.contains('hidden');
      const vis = this._isSubVisible(sub);
      el.classList.toggle('hidden', !vis);

      // Auto-play animation when a sub transitions from hidden to visible
      if (wasHidden && vis && sub.animation && !this._activatedSubs.has(sub.id)) {
        this._autoAnimate(sub, el);
      }
    }
  }

  /** Auto-play animation on a sub-hotspot (e.g. door swings open when revealed) */
  _autoAnimate(sub, el) {
    this._activatedSubs.add(sub.id);
    const dur = this._animDuration(sub.animation.type);
    // Small delay so the element is visible before animating
    requestAnimationFrame(() => {
      el.classList.add('activated');
      if (sub.imageOpen) {
        setTimeout(() => this._swapToOpenImage(el, sub), dur);
      }
      // Set the anim flag after animation completes so dependent subs appear in sequence
      setTimeout(() => {
        this.state.setFlag('_zoomAnim_' + sub.id, true);
      }, dur + 50);
    });
  }

  /* ---- Interaction ---- */

  _onSubClick(sub, el) {
    const trigger = this._matchTrigger(sub);
    if (!trigger) return;

    // Clear inventory selection after useItem match
    if (trigger.type === 'useItem' && this._inventoryUI) {
      this._inventoryUI.clearSelection();
    }

    const givesItem = trigger.actions.some(a => a.type === 'giveItem');
    const shouldHide = sub.hideOnCollect && givesItem;

    // 1) Play animation if defined
    let justAnimated = false;
    if (sub.animation && !this._activatedSubs.has(sub.id)) {
      justAnimated = true;
      this._activatedSubs.add(sub.id);
      el.classList.add('activated');

      const dur = this._animDuration(sub.animation.type);
      // Swap to open-state image after animation
      if (sub.imageOpen) {
        setTimeout(() => this._swapToOpenImage(el, sub), dur);
      }
      // Set anim flag after animation completes so dependent subs appear in sequence
      setTimeout(() => {
        this.state.setFlag('_zoomAnim_' + sub.id, true);
      }, dur + 50);
    }

    // 2) If collecting an item, animate pickup then execute
    if (shouldHide) {
      const animDelay = sub.animation ? this._animDuration(sub.animation.type) + 50 : 0;
      setTimeout(() => {
        this._animatePickup(el, () => {
          this.state.setFlag('_zoomHidden_' + sub.id, true);
          el.classList.add('hidden');
          this._execTrigger(trigger, sub);
        });
      }, animDelay);
      return;
    }

    // 3) Otherwise just execute actions (with anim delay if needed)
    const animDelay = justAnimated ? this._animDuration(sub.animation.type) : 0;
    // Small delay so animation plays before actions fire
    setTimeout(() => this._execTrigger(trigger, sub), animDelay > 0 ? animDelay + 50 : 0);
  }

  /** Swap or create the imageOpen on a sub-hotspot element */
  _swapToOpenImage(el, sub) {
    if (!sub.imageOpen) return;
    let img = el.querySelector('img');
    if (img) {
      img.src = sub.imageOpen;
    } else {
      img = document.createElement('img');
      img.src = sub.imageOpen;
      img.alt = sub.label || '';
      img.draggable = false;
      el.appendChild(img);
    }
  }

  _animDuration(type) {
    const durations = { 'rotate': 400, 'slide-down': 350, 'slide-right': 350,
                        'swing': 400, 'fade-in': 350, 'scale-pop': 300 };
    return durations[type] || 400;
  }

  _matchTrigger(sub) {
    if (!sub.triggers) return null;
    const selectedItem = this._inventoryUI ? this._inventoryUI.getSelectedItemId() : null;
    for (let i = 0; i < sub.triggers.length; i++) {
      const t = sub.triggers[i];
      if (t.once && this.state.hasOnceFired('zoom_' + sub.id, i)) continue;
      if (t.requiredFlags && !this.state.checkFlags(t.requiredFlags)) continue;
      if (t.type === 'useItem') {
        if (!selectedItem) continue;
        if (t.requiredItem && t.requiredItem !== selectedItem) continue;
      } else {
        // For tap triggers, skip if an item is selected (prefer useItem match)
        if (selectedItem) continue;
      }
      return t;
    }
    return null;
  }

  _execTrigger(trigger, sub) {
    if (trigger.once) {
      const idx = sub.triggers.indexOf(trigger);
      this.state.markOnceFired('zoom_' + sub.id, idx);
    }

    const hasUI = trigger.actions.some(a =>
      a.type === 'showMessage' || a.type === 'triggerPuzzle' || a.type === 'openZoom');

    if (hasUI) {
      // Close zoom so dialogs render cleanly on top
      this.close();
      setTimeout(() => {
        EventBus.emit('zoom:executeActions', { actions: trigger.actions });
      }, 300);
    } else {
      EventBus.emit('zoom:executeActions', { actions: trigger.actions });
    }
  }

  /* ---- Pickup animation: item flies to inventory ---- */

  _animatePickup(el, onComplete) {
    const inv = this.container.querySelector('.inventory');
    if (!inv) { onComplete(); return; }

    const elRect = el.getBoundingClientRect();
    const invRect = inv.getBoundingClientRect();

    // Create flying clone
    const clone = el.cloneNode(true);
    clone.style.cssText = `
      position: fixed;
      left: ${elRect.left}px;
      top: ${elRect.top}px;
      width: ${elRect.width}px;
      height: ${elRect.height}px;
      z-index: 9999;
      pointer-events: none;
      border-radius: 8px;
      filter: drop-shadow(0 0 12px rgba(255,220,100,0.8));
    `;
    document.body.appendChild(clone);

    const targetX = invRect.left + invRect.width / 2 - elRect.width / 2;
    const targetY = invRect.top + invRect.height / 2 - elRect.height / 2;

    // Force reflow then animate
    clone.getBoundingClientRect();
    clone.style.transition = 'all 0.55s cubic-bezier(0.2, 0, 0.2, 1)';
    requestAnimationFrame(() => {
      clone.style.left = targetX + 'px';
      clone.style.top = targetY + 'px';
      clone.style.transform = 'scale(0.25)';
      clone.style.opacity = '0.3';
    });

    setTimeout(() => {
      clone.remove();
      onComplete();
    }, 600);
  }

  destroy() {
    this.overlay.remove();
  }
}
