import EventBus from '../core/EventBus.js';
import { Room } from '../core/RoomData.js';
import { validateRoom } from '../core/SchemaValidator.js';

/**
 * Export room as JSON file, import from file, auto-save to localStorage.
 */
export default class ExportImport {
  constructor(room) {
    this.room = room;
    this._autoSaveKey = `ere_editor_${room.id}`;
    this._autoSaveTimer = null;

    // Auto-save on changes (debounced 2s)
    EventBus.on('editor:changed', () => this._scheduleAutoSave());
  }

  setRoom(room) {
    this.room = room;
    this._autoSaveKey = `ere_editor_${room.id}`;
  }

  // --- Export ---

  exportJSON() {
    const json = JSON.stringify(this.room.toJSON(), null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${this.room.id || 'room'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // --- Import ---

  importFromFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const data = JSON.parse(reader.result);
          const validation = validateRoom(data);
          if (!validation.valid) {
            console.warn('Import validation:', validation.errors);
          }
          const room = Room.fromJSON(data);
          resolve(room);
        } catch (err) {
          reject(new Error('Invalid JSON: ' + err.message));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }

  // --- Auto-save ---

  _scheduleAutoSave() {
    clearTimeout(this._autoSaveTimer);
    this._autoSaveTimer = setTimeout(() => this.autoSave(), 2000);
  }

  autoSave() {
    try {
      const json = JSON.stringify(this.room.toJSON());
      localStorage.setItem(this._autoSaveKey, json);
      EventBus.emit('editor:autoSaved', {});
    } catch (e) {
      console.warn('Auto-save failed:', e);
    }
  }

  loadAutoSave() {
    try {
      const raw = localStorage.getItem(this._autoSaveKey);
      if (!raw) return null;
      return Room.fromJSON(JSON.parse(raw));
    } catch {
      return null;
    }
  }

  hasAutoSave() {
    return localStorage.getItem(this._autoSaveKey) !== null;
  }

  clearAutoSave() {
    localStorage.removeItem(this._autoSaveKey);
  }
}
