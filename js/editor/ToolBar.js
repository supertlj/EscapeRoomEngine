import EventBus from '../core/EventBus.js';
import { Hotspot, Item, Puzzle } from '../core/RoomData.js';

/**
 * Editor toolbar: add hotspot, add item, add puzzle, room settings.
 */
export default class ToolBar {
  constructor(room) {
    this.room = room;
    this._nextHotspotNum = room.hotspots.length + 1;
    this._nextItemNum = room.items.length + 1;
    this._nextPuzzleNum = room.puzzles.length + 1;
  }

  setRoom(room) {
    this.room = room;
  }

  addHotspot() {
    const id = `hs_${this._nextHotspotNum++}`;
    const hs = new Hotspot({
      id,
      label: `Hotspot ${this._nextHotspotNum - 1}`,
      shape: 'rect',
      bounds: { x: 100, y: 100, w: 100, h: 80 },
      appearance: { fill: '#666666', stroke: '#444444' },
      zIndex: this.room.hotspots.length,
      visible: true,
      triggers: []
    });
    this.room.hotspots.push(hs);
    EventBus.emit('editor:hotspotAdded', { hotspot: hs });
    EventBus.emit('editor:changed', {});
    return hs;
  }

  addItem() {
    const id = `item_${this._nextItemNum++}`;
    const item = new Item({
      id,
      name: `Item ${this._nextItemNum - 1}`,
      description: '',
      icon: { shape: 'rect', color: '#888888' }
    });
    this.room.items.push(item);
    EventBus.emit('editor:itemAdded', { item });
    EventBus.emit('editor:changed', {});
    return item;
  }

  addPuzzle() {
    const id = `puzzle_${this._nextPuzzleNum++}`;
    const puzzle = new Puzzle({
      id,
      type: 'combination',
      prompt: 'Enter the code:',
      solution: '0000',
      onSolve: [{ type: 'showMessage', params: { message: 'Solved!' } }],
      onFail: [{ type: 'showMessage', params: { message: 'Wrong.' } }]
    });
    this.room.puzzles.push(puzzle);
    EventBus.emit('editor:puzzleAdded', { puzzle });
    EventBus.emit('editor:changed', {});
    return puzzle;
  }

  updateRoomSettings(name, width, height, bgColor) {
    if (name !== undefined) this.room.name = name;
    if (width !== undefined) this.room.width = Math.max(200, parseInt(width) || 800);
    if (height !== undefined) this.room.height = Math.max(200, parseInt(height) || 600);
    if (bgColor !== undefined) this.room.background = { type: 'color', value: bgColor };
    EventBus.emit('editor:roomSettingsChanged', {});
    EventBus.emit('editor:changed', {});
  }
}
