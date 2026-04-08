import EventBus from '../core/EventBus.js';

/**
 * Inventory bar: displays items, handles selection, item-on-item combining.
 * Renders as a horizontal bar at the bottom of the game view.
 */
export default class InventoryUI {
  /**
   * @param {HTMLElement} container - element to append the inventory bar into
   * @param {import('../core/StateManager.js').default} state
   * @param {import('../core/RoomData.js').Room} room
   */
  constructor(container, state, room) {
    this.container = container;
    this.state = state;
    this.room = room;
    this.selectedItemId = null;
    this.maxSlots = 8;

    this._createElement();

    EventBus.on('state:inventoryChanged', () => this.render());
  }

  setRoom(room) {
    this.room = room;
  }

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
          if (itemId === this.selectedItemId) {
            slot.classList.add('active');
          }
          slot.textContent = this._getItemEmoji(item);
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
      // Deselect
      this.selectedItemId = null;
      EventBus.emit('inventory:deselect', {});
    } else if (this.selectedItemId) {
      // Attempt to combine selected item with clicked item
      EventBus.emit('inventory:combine', {
        itemA: this.selectedItemId,
        itemB: itemId
      });
      this.selectedItemId = null;
    } else {
      // Select this item
      this.selectedItemId = itemId;
      EventBus.emit('inventory:select', { itemId });
    }
    this.render();
  }

  getSelectedItemId() {
    return this.selectedItemId;
  }

  clearSelection() {
    this.selectedItemId = null;
    this.render();
  }

  _getItemEmoji(item) {
    // Map icon shapes to simple emoji/text representations
    const shapeMap = {
      key: '\u{1F511}',      // 🔑
      rect: '\u{1F4C4}',     // 📄
      circle: '\u{26AA}',     // ⚪
      bottle: '\u{1F9EA}',   // 🧪
      gem: '\u{1F48E}',      // 💎
    };
    return shapeMap[item.icon?.shape] || '\u{1F4E6}'; // 📦 default
  }

  destroy() {
    this.el.remove();
  }
}
