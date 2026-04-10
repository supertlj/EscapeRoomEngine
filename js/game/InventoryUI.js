import EventBus from '../core/EventBus.js';

/**
 * Inventory bar with item images, selection, combining, and pickup flash.
 */
export default class InventoryUI {
  constructor(container, state, room) {
    this.container = container;
    this.state = state;
    this.room = room;
    this.selectedItemId = null;
    this.maxSlots = 8;
    this._justReceived = null; // item ID that was just added (for flash)

    this._createElement();

    EventBus.on('state:inventoryChanged', () => this.render());
    EventBus.on('action:giveItem', ({ itemId }) => {
      this._justReceived = itemId;
      this.render();
      // Clear flash after animation
      setTimeout(() => { this._justReceived = null; }, 700);
    });
  }

  setRoom(room) { this.room = room; }

  _createElement() {
    this.el = document.createElement('div');
    this.el.className = 'inventory';
    this.container.appendChild(this.el);
    this.render();
  }

  render() {
    this.el.innerHTML = '';

    for (let i = 0; i < this.maxSlots; i++) {
      const itemId = this.state.inventory[i];
      const slot = document.createElement('div');
      slot.className = 'inv-slot';

      if (itemId) {
        const item = this.room.getItem(itemId);
        if (item) {
          slot.classList.add('filled');
          if (itemId === this.selectedItemId) slot.classList.add('active');
          if (itemId === this._justReceived) slot.classList.add('just-received');

          // Prefer item image, fall back to emoji
          if (item.icon && item.icon.image) {
            const img = document.createElement('img');
            img.className = 'inv-item-img';
            img.src = item.icon.image;
            img.alt = item.name;
            img.draggable = false;
            slot.appendChild(img);
          } else {
            slot.textContent = this._getItemEmoji(item);
          }

          slot.title = item.name;
          slot.dataset.itemId = itemId;
          slot.addEventListener('click', () => this._onSlotClick(itemId));
        }
      } else {
        slot.classList.add('empty');
      }

      this.el.appendChild(slot);
    }
  }

  _onSlotClick(itemId) {
    if (this.selectedItemId === itemId) {
      this.selectedItemId = null;
      EventBus.emit('inventory:deselect', {});
    } else if (this.selectedItemId) {
      EventBus.emit('inventory:combine', { itemA: this.selectedItemId, itemB: itemId });
      this.selectedItemId = null;
    } else {
      this.selectedItemId = itemId;
      EventBus.emit('inventory:select', { itemId });
    }
    this.render();
  }

  getSelectedItemId() { return this.selectedItemId; }

  clearSelection() {
    this.selectedItemId = null;
    this.render();
  }

  _getItemEmoji(item) {
    const map = {
      key: '\u{1F511}', rect: '\u{1F4C4}', circle: '\u{26AA}',
      bottle: '\u{1F9EA}', gem: '\u{1F48E}',
    };
    return map[item.icon?.shape] || '\u{1F4E6}';
  }

  destroy() { this.el.remove(); }
}
