import EventBus from '../core/EventBus.js';
import { Hotspot } from '../core/RoomData.js';

/**
 * Property panel: edits selected hotspot properties + trigger/action builder.
 */
export default class PropertyPanel {
  /**
   * @param {HTMLElement} container
   * @param {import('../core/RoomData.js').Room} room
   * @param {import('./AssetManager.js').default} [assetManager]
   */
  constructor(container, room, assetManager = null) {
    this.container = container;
    this.room = room;
    this.assetManager = assetManager;
    this.hotspot = null;
    this._renderEmpty();

    EventBus.on('editor:select', ({ hotspotId }) => {
      this.hotspot = room.hotspots.find(h => h.id === hotspotId) || null;
      this.render();
    });
    EventBus.on('editor:deselect', () => {
      this.hotspot = null;
      this._renderEmpty();
    });
    EventBus.on('editor:hotspotMoved', ({ hotspot }) => {
      if (this.hotspot && this.hotspot.id === hotspot.id) {
        this._updatePositionFields();
      }
    });
  }

  setRoom(room) {
    this.room = room;
    this.hotspot = null;
    this._renderEmpty();
  }

  _renderEmpty() {
    this.container.innerHTML = `
      <h3>Properties</h3>
      <div class="empty-state">Select a hotspot to edit its properties</div>
    `;
  }

  render() {
    if (!this.hotspot) { this._renderEmpty(); return; }
    const hs = this.hotspot;

    this.container.innerHTML = `
      <h3>${hs.label || hs.id}</h3>

      <div class="prop-group">
        <label>ID</label>
        <input type="text" data-field="id" value="${hs.id}" />
      </div>
      <div class="prop-group">
        <label>Label</label>
        <input type="text" data-field="label" value="${hs.label}" />
      </div>
      <div class="prop-row">
        <div class="prop-group">
          <label>Shape</label>
          <select data-field="shape">
            <option value="rect" ${hs.shape === 'rect' ? 'selected' : ''}>Rectangle</option>
            <option value="circle" ${hs.shape === 'circle' ? 'selected' : ''}>Circle</option>
          </select>
        </div>
        <div class="prop-group">
          <label>Z-Index</label>
          <input type="number" data-field="zIndex" value="${hs.zIndex}" />
        </div>
      </div>
      <div class="prop-row">
        <div class="prop-group">
          <label>X</label>
          <input type="number" data-field="x" value="${hs.bounds.x}" />
        </div>
        <div class="prop-group">
          <label>Y</label>
          <input type="number" data-field="y" value="${hs.bounds.y}" />
        </div>
        <div class="prop-group">
          <label>W</label>
          <input type="number" data-field="w" value="${hs.bounds.w}" />
        </div>
        <div class="prop-group">
          <label>H</label>
          <input type="number" data-field="h" value="${hs.bounds.h}" />
        </div>
      </div>
      <div class="prop-row">
        <div class="prop-group">
          <label>Fill</label>
          <input type="color" data-field="fill" value="${hs.appearance.fill || '#888888'}" />
        </div>
        <div class="prop-group">
          <label>Stroke</label>
          <input type="color" data-field="stroke" value="${hs.appearance.stroke || '#555555'}" />
        </div>
      </div>
      <div class="prop-group">
        <label>Visible</label>
        <select data-field="visible">
          <option value="true" ${hs.visible ? 'selected' : ''}>Yes</option>
          <option value="false" ${!hs.visible ? 'selected' : ''}>No</option>
        </select>
      </div>
      <div class="prop-group">
        <label>Image</label>
        ${hs.appearance.image
          ? `<div style="margin-bottom:4px;"><img src="${hs.appearance.image}" style="max-width:100%;max-height:60px;border-radius:3px;border:1px solid var(--border);" /></div>
             <button class="add-btn" id="changeImageBtn">Change Image</button>
             <button class="add-btn" id="removeImageBtn" style="margin-top:4px;color:var(--danger);border-color:var(--danger);">Remove Image</button>`
          : `<button class="add-btn" id="addImageBtn">+ Add Image</button>`
        }
      </div>

      <h3>Triggers (${hs.triggers.length})</h3>
      <div class="trigger-list" id="triggerList"></div>
      <button class="add-btn" id="addTriggerBtn">+ Add Trigger</button>
    `;

    this._renderTriggers();
    this._bindInputs();
  }

  _renderTriggers() {
    const list = this.container.querySelector('#triggerList');
    if (!list || !this.hotspot) return;

    list.innerHTML = '';
    this.hotspot.triggers.forEach((trigger, ti) => {
      const card = document.createElement('div');
      card.className = 'trigger-card';

      let flagsStr = (trigger.requiredFlags || []).join(', ') || 'none';
      let actionsHtml = (trigger.actions || []).map((a, ai) => {
        const paramStr = a.params ? Object.entries(a.params).map(([k,v]) => `${k}: ${v}`).join(', ') : '';
        return `
          <div class="action-card">
            <div class="action-header">
              <select data-trigger="${ti}" data-action="${ai}" data-afield="type">
                ${['showMessage','setFlag','giveItem','removeItem','showHotspot','hideHotspot','triggerPuzzle','transitionRoom','gameWin','gameLose']
                  .map(t => `<option value="${t}" ${a.type === t ? 'selected' : ''}>${t}</option>`).join('')}
              </select>
              <button class="action-remove" data-trigger="${ti}" data-action="${ai}">&times;</button>
            </div>
            <input type="text" data-trigger="${ti}" data-action="${ai}" data-afield="params"
                   value='${JSON.stringify(a.params || {})}' placeholder='{"key":"value"}' />
          </div>
        `;
      }).join('');

      card.innerHTML = `
        <div class="trigger-header">
          <span class="trigger-type">${trigger.type || 'tap'}${trigger.once ? ' (once)' : ''}</span>
          <button class="trigger-remove" data-trigger="${ti}">&times;</button>
        </div>
        <div class="prop-row" style="margin-bottom:4px;">
          <div class="prop-group" style="flex:1">
            <label>Type</label>
            <select data-trigger="${ti}" data-tfield="type">
              <option value="tap" ${trigger.type === 'tap' ? 'selected' : ''}>tap</option>
              <option value="useItem" ${trigger.type === 'useItem' ? 'selected' : ''}>useItem</option>
            </select>
          </div>
          <div class="prop-group" style="flex:1">
            <label>Once</label>
            <select data-trigger="${ti}" data-tfield="once">
              <option value="false" ${!trigger.once ? 'selected' : ''}>No</option>
              <option value="true" ${trigger.once ? 'selected' : ''}>Yes</option>
            </select>
          </div>
        </div>
        <div class="prop-group">
          <label>Required Flags (comma-sep)</label>
          <input type="text" data-trigger="${ti}" data-tfield="requiredFlags" value="${flagsStr !== 'none' ? flagsStr : ''}" />
        </div>
        <div class="prop-group">
          <label>Required Item</label>
          <input type="text" data-trigger="${ti}" data-tfield="requiredItem" value="${trigger.requiredItem || ''}" placeholder="item_id or empty" />
        </div>
        <label style="color:var(--text-dim);font-size:10px;text-transform:uppercase;margin-top:6px;display:block;">Actions</label>
        ${actionsHtml}
        <button class="add-btn" data-add-action="${ti}" style="margin-top:4px;">+ Add Action</button>
      `;

      list.appendChild(card);
    });

    this._bindTriggerEvents();
  }

  _bindInputs() {
    const hs = this.hotspot;
    if (!hs) return;

    // Simple field inputs
    this.container.querySelectorAll('[data-field]').forEach(input => {
      input.addEventListener('change', () => {
        const field = input.dataset.field;
        const val = input.value;
        switch (field) {
          case 'id': hs.id = val; break;
          case 'label': hs.label = val; this.container.querySelector('h3').textContent = val; break;
          case 'shape': hs.shape = val; break;
          case 'zIndex': hs.zIndex = parseInt(val) || 0; break;
          case 'x': hs.bounds.x = parseInt(val) || 0; break;
          case 'y': hs.bounds.y = parseInt(val) || 0; break;
          case 'w': hs.bounds.w = Math.max(20, parseInt(val) || 20); break;
          case 'h': hs.bounds.h = Math.max(20, parseInt(val) || 20); break;
          case 'fill': hs.appearance.fill = val; break;
          case 'stroke': hs.appearance.stroke = val; break;
          case 'visible': hs.visible = val === 'true'; break;
        }
        EventBus.emit('editor:changed', {});
        EventBus.emit('editor:propertyChanged', { hotspot: hs });
      });
    });

    // Image buttons
    const pickImage = async () => {
      if (!this.assetManager) return;
      try {
        const { dataUrl, img } = await this.assetManager.pickImage();
        hs.appearance.image = dataUrl;
        hs.appearance._img = img;
        EventBus.emit('editor:changed', {});
        EventBus.emit('editor:propertyChanged', { hotspot: hs });
        this.render();
      } catch {}
    };
    this.container.querySelector('#addImageBtn')?.addEventListener('click', pickImage);
    this.container.querySelector('#changeImageBtn')?.addEventListener('click', pickImage);
    this.container.querySelector('#removeImageBtn')?.addEventListener('click', () => {
      hs.appearance.image = null;
      hs.appearance._img = null;
      EventBus.emit('editor:changed', {});
      EventBus.emit('editor:propertyChanged', { hotspot: hs });
      this.render();
    });

    // Add trigger
    this.container.querySelector('#addTriggerBtn')?.addEventListener('click', () => {
      hs.triggers.push({
        type: 'tap',
        requiredFlags: [],
        requiredItem: null,
        once: false,
        actions: [{ type: 'showMessage', params: { message: 'You see something...' } }]
      });
      this.render();
      EventBus.emit('editor:changed', {});
    });
  }

  _bindTriggerEvents() {
    const hs = this.hotspot;
    if (!hs) return;

    // Remove trigger
    this.container.querySelectorAll('.trigger-remove').forEach(btn => {
      btn.addEventListener('click', () => {
        const ti = parseInt(btn.dataset.trigger);
        hs.triggers.splice(ti, 1);
        this.render();
        EventBus.emit('editor:changed', {});
      });
    });

    // Trigger field changes
    this.container.querySelectorAll('[data-tfield]').forEach(input => {
      input.addEventListener('change', () => {
        const ti = parseInt(input.dataset.trigger);
        const field = input.dataset.tfield;
        const trigger = hs.triggers[ti];
        if (!trigger) return;
        switch (field) {
          case 'type': trigger.type = input.value; break;
          case 'once': trigger.once = input.value === 'true'; break;
          case 'requiredFlags':
            trigger.requiredFlags = input.value ? input.value.split(',').map(s => s.trim()).filter(Boolean) : [];
            break;
          case 'requiredItem':
            trigger.requiredItem = input.value.trim() || null;
            break;
        }
        this._renderTriggers();
        EventBus.emit('editor:changed', {});
      });
    });

    // Action field changes
    this.container.querySelectorAll('[data-afield]').forEach(input => {
      input.addEventListener('change', () => {
        const ti = parseInt(input.dataset.trigger);
        const ai = parseInt(input.dataset.action);
        const action = hs.triggers[ti]?.actions[ai];
        if (!action) return;
        const field = input.dataset.afield;
        if (field === 'type') {
          action.type = input.value;
        } else if (field === 'params') {
          try { action.params = JSON.parse(input.value); } catch {}
        }
        EventBus.emit('editor:changed', {});
      });
    });

    // Remove action
    this.container.querySelectorAll('.action-remove').forEach(btn => {
      btn.addEventListener('click', () => {
        const ti = parseInt(btn.dataset.trigger);
        const ai = parseInt(btn.dataset.action);
        hs.triggers[ti]?.actions.splice(ai, 1);
        this._renderTriggers();
        EventBus.emit('editor:changed', {});
      });
    });

    // Add action
    this.container.querySelectorAll('[data-add-action]').forEach(btn => {
      btn.addEventListener('click', () => {
        const ti = parseInt(btn.dataset.addAction);
        hs.triggers[ti]?.actions.push({ type: 'showMessage', params: { message: '' } });
        this._renderTriggers();
        EventBus.emit('editor:changed', {});
      });
    });
  }

  _updatePositionFields() {
    if (!this.hotspot) return;
    const hs = this.hotspot;
    const xInput = this.container.querySelector('[data-field="x"]');
    const yInput = this.container.querySelector('[data-field="y"]');
    const wInput = this.container.querySelector('[data-field="w"]');
    const hInput = this.container.querySelector('[data-field="h"]');
    if (xInput) xInput.value = hs.bounds.x;
    if (yInput) yInput.value = hs.bounds.y;
    if (wInput) wInput.value = hs.bounds.w;
    if (hInput) hInput.value = hs.bounds.h;
  }
}
