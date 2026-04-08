/**
 * Minimal pub/sub event system.
 * Usage:
 *   EventBus.on('hotspot:tap', handler)
 *   EventBus.emit('hotspot:tap', { id: 'hs_painting' })
 *   EventBus.off('hotspot:tap', handler)
 */
const listeners = new Map();

const EventBus = {
  on(event, fn) {
    if (!listeners.has(event)) listeners.set(event, []);
    listeners.get(event).push(fn);
  },

  off(event, fn) {
    const fns = listeners.get(event);
    if (!fns) return;
    const i = fns.indexOf(fn);
    if (i !== -1) fns.splice(i, 1);
  },

  emit(event, data) {
    const fns = listeners.get(event);
    if (!fns) return;
    for (const fn of fns) fn(data);
  },

  clear() {
    listeners.clear();
  }
};

export default EventBus;
