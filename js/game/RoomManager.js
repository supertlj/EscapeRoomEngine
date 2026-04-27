import EventBus from '../core/EventBus.js';
import { Room } from '../core/RoomData.js';
import { validateRoom } from '../core/SchemaValidator.js';
import { resolveRoomPath, RoomNotFoundError } from '../core/ChapterIndex.js';

/**
 * Multi-room loading and transitions.
 * Loads room JSON files on demand, preserves inventory + flags across rooms.
 *
 * Path resolution is delegated to ChapterIndex — RoomManager never builds
 * paths itself. The roomId passed in (e.g. "apartment") is the manifest-level
 * lookup key. The internal Room.id (e.g. "room_apartment") may differ.
 *
 * The cache is keyed by the lookup key (the roomId argument passed in),
 * not by the internal Room.id, so callers can re-request by lookup key.
 */
export default class RoomManager {
  /**
   * @param {import('../core/StateManager.js').default} state
   * @param {object} options
   * @param {function} options.onRoomLoaded - callback(room) when a new room is ready
   */
  constructor(state, options = {}) {
    this.state = state;
    this.rooms = new Map(); // lookupKey -> Room (cache)
    this.currentRoom = null;
    this.onRoomLoaded = options.onRoomLoaded || null;

    EventBus.on('action:transitionRoom', ({ roomId }) => {
      this.loadRoom(roomId);
    });
  }

  /**
   * Pre-cache a room (e.g., the starting room loaded externally).
   * @param {Room} room
   * @param {string} [lookupKey] — manifest-level id; falls back to room.id
   */
  registerRoom(room, lookupKey) {
    this.rooms.set(lookupKey || room.id, room);
  }

  async loadRoom(roomId) {
    let room = this.rooms.get(roomId);

    if (!room) {
      let path;
      try {
        path = resolveRoomPath(roomId);
      } catch (err) {
        if (err instanceof RoomNotFoundError) {
          console.error(err.message);
          EventBus.emit('action:showMessage', {
            message: `This room isn't ready yet: ${roomId}`,
            onDismiss: () => {}
          });
          return;
        }
        throw err;
      }

      try {
        const resp = await fetch(path);
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const data = await resp.json();

        const validation = validateRoom(data);
        if (!validation.valid) {
          console.warn(`Room ${roomId} validation:`, validation.errors);
        }

        room = Room.fromJSON(data);
        this.rooms.set(roomId, room);
      } catch (err) {
        console.error(`Failed to load room ${roomId} from ${path}:`, err);
        EventBus.emit('action:showMessage', {
          message: `Failed to load room: ${roomId}`,
          onDismiss: () => {}
        });
        return;
      }
    }

    this.currentRoom = room;
    // Save state stores the manifest-level lookup key (e.g. "apartment"),
    // not the internal room.id (e.g. "room_apartment"), so resumption
    // can route back through ChapterIndex.resolveRoomPath().
    this.state.currentRoomId = roomId;

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
