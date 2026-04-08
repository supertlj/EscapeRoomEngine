import EventBus from '../core/EventBus.js';
import { Room } from '../core/RoomData.js';
import { validateRoom } from '../core/SchemaValidator.js';

/**
 * Multi-room loading and transitions.
 * Loads room JSON files on demand, preserves inventory + flags across rooms.
 */
export default class RoomManager {
  /**
   * @param {import('../core/StateManager.js').default} state
   * @param {object} options
   * @param {function} options.onRoomLoaded - callback(room) when a new room is ready
   */
  constructor(state, options = {}) {
    this.state = state;
    this.rooms = new Map(); // id -> Room (cache)
    this.currentRoom = null;
    this.onRoomLoaded = options.onRoomLoaded || null;
    this._basePath = 'js/data/';

    EventBus.on('action:transitionRoom', ({ roomId }) => {
      this.loadRoom(roomId);
    });
  }

  /** Pre-cache a room (e.g., the starting room loaded externally) */
  registerRoom(room) {
    this.rooms.set(room.id, room);
  }

  async loadRoom(roomId) {
    let room = this.rooms.get(roomId);

    if (!room) {
      try {
        const resp = await fetch(`${this._basePath}${roomId}.json`);
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const data = await resp.json();

        const validation = validateRoom(data);
        if (!validation.valid) {
          console.warn(`Room ${roomId} validation:`, validation.errors);
        }

        room = Room.fromJSON(data);
        this.rooms.set(roomId, room);
      } catch (err) {
        console.error(`Failed to load room ${roomId}:`, err);
        EventBus.emit('action:showMessage', {
          message: `Failed to load room: ${roomId}`,
          onDismiss: () => {}
        });
        return;
      }
    }

    this.currentRoom = room;
    this.state.currentRoomId = room.id;

    EventBus.emit('room:loaded', { room });

    if (this.onRoomLoaded) {
      this.onRoomLoaded(room);
    }

    // Execute onEnter actions for the new room
    if (room.onEnter && room.onEnter.length > 0) {
      EventBus.emit('room:enterActions', { actions: room.onEnter });
    }
  }
}
