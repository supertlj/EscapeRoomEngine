import EventBus from '../core/EventBus.js';

/**
 * Visual effects system: particle bursts, screen flash, shake, ripple.
 * Triggered by game events (puzzle solve, item pickup, wrong answer, win).
 */
export default class VisualFX {
  constructor(container) {
    this.container = container;

    // Particle canvas (fixed overlay)
    this.particleEl = document.createElement('div');
    this.particleEl.className = 'fx-particles';
    document.body.appendChild(this.particleEl);

    // Flash overlay
    this.flashEl = document.createElement('div');
    this.flashEl.className = 'fx-flash';
    document.body.appendChild(this.flashEl);

    // Auto-bind to game events
    EventBus.on('fx:particles', (d) => this.particles(d.x, d.y, d.color, d.count));
    EventBus.on('fx:flash', (d) => this.flash(d.color));
    EventBus.on('fx:shake', () => this.shake());
    EventBus.on('fx:ripple', (d) => this.ripple(d.x, d.y));
    EventBus.on('fx:success', () => this.successBurst());

    // Puzzle solve → celebration
    EventBus.on('action:gameWin', () => {
      this.successBurst();
      setTimeout(() => this.successBurst(), 300);
      setTimeout(() => this.successBurst(), 600);
    });
  }

  /** Gold particle burst — used for puzzle solve, item pickup */
  particles(x, y, color = '#c4a35a', count = 20) {
    const colors = [color, '#ffd700', '#fff4c2', '#e8c547', '#d4a030'];
    for (let i = 0; i < count; i++) {
      const p = document.createElement('div');
      p.className = 'fx-particle';
      const size = 3 + Math.random() * 5;
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.8;
      const dist = 40 + Math.random() * 100;
      const px = Math.cos(angle) * dist;
      const py = Math.sin(angle) * dist - 30; // bias upward
      const c = colors[Math.floor(Math.random() * colors.length)];
      const dur = 0.5 + Math.random() * 0.4;

      p.style.cssText = `
        left: ${x}px; top: ${y}px;
        width: ${size}px; height: ${size}px;
        background: ${c};
        box-shadow: 0 0 ${size}px ${c};
        --px: ${px}px; --py: ${py}px;
        animation: particleBurst ${dur}s ease-out forwards;
      `;
      this.particleEl.appendChild(p);
      setTimeout(() => p.remove(), dur * 1000 + 50);
    }
  }

  /** Full-screen color flash */
  flash(color = 'rgba(255,220,100,0.5)') {
    this.flashEl.style.background = color;
    this.flashEl.classList.remove('active');
    void this.flashEl.offsetWidth; // force reflow
    this.flashEl.classList.add('active');
    setTimeout(() => this.flashEl.classList.remove('active'), 600);
  }

  /** Screen shake on wrong answer */
  shake() {
    this.container.classList.remove('fx-shake');
    void this.container.offsetWidth;
    this.container.classList.add('fx-shake');
    setTimeout(() => this.container.classList.remove('fx-shake'), 500);
  }

  /** Expanding golden ripple from a point */
  ripple(x, y) {
    const r = document.createElement('div');
    r.className = 'fx-ripple';
    r.style.left = x + 'px';
    r.style.top = y + 'px';
    document.body.appendChild(r);
    setTimeout(() => r.remove(), 900);
  }

  /** Combined celebration for puzzle solve / win */
  successBurst() {
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    this.particles(cx, cy, '#c4a35a', 30);
    this.flash('rgba(255,220,100,0.25)');
    this.ripple(cx, cy);
  }

  /** Subtle sparkle near a point (item found) */
  sparkle(x, y) {
    this.particles(x, y, '#ffd700', 10);
  }

  destroy() {
    this.particleEl.remove();
    this.flashEl.remove();
  }
}
