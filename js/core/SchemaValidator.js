/**
 * Validates room and room-set JSON on import.
 * Returns { valid: boolean, errors: string[] }
 */

export function validateRoom(data) {
  const errors = [];

  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Room data must be an object'] };
  }

  // Required fields
  if (!data.id) errors.push('Missing required field: id');
  if (!data.name) errors.push('Missing required field: name');
  if (typeof data.width !== 'number' || data.width <= 0) errors.push('width must be a positive number');
  if (typeof data.height !== 'number' || data.height <= 0) errors.push('height must be a positive number');

  // Collect defined IDs for cross-reference checks
  const hotspotIds = new Set();
  const itemIds = new Set();
  const puzzleIds = new Set();

  // Hotspots
  if (data.hotspots) {
    if (!Array.isArray(data.hotspots)) {
      errors.push('hotspots must be an array');
    } else {
      for (const hs of data.hotspots) {
        if (!hs.id) { errors.push('Hotspot missing id'); continue; }
        if (hotspotIds.has(hs.id)) errors.push(`Duplicate hotspot id: ${hs.id}`);
        hotspotIds.add(hs.id);

        if (!hs.bounds || typeof hs.bounds.x !== 'number') {
          errors.push(`Hotspot ${hs.id}: missing or invalid bounds`);
        }
        if (hs.triggers && !Array.isArray(hs.triggers)) {
          errors.push(`Hotspot ${hs.id}: triggers must be an array`);
        }
      }
    }
  }

  // Items
  if (data.items) {
    if (!Array.isArray(data.items)) {
      errors.push('items must be an array');
    } else {
      for (const item of data.items) {
        if (!item.id) { errors.push('Item missing id'); continue; }
        if (itemIds.has(item.id)) errors.push(`Duplicate item id: ${item.id}`);
        itemIds.add(item.id);
      }
    }
  }

  // Puzzles
  if (data.puzzles) {
    if (!Array.isArray(data.puzzles)) {
      errors.push('puzzles must be an array');
    } else {
      for (const pz of data.puzzles) {
        if (!pz.id) { errors.push('Puzzle missing id'); continue; }
        if (puzzleIds.has(pz.id)) errors.push(`Duplicate puzzle id: ${pz.id}`);
        puzzleIds.add(pz.id);

        if (!pz.type) errors.push(`Puzzle ${pz.id}: missing type`);
        if (pz.hotspotId && !hotspotIds.has(pz.hotspotId)) {
          errors.push(`Puzzle ${pz.id}: references undefined hotspot "${pz.hotspotId}"`);
        }
      }
    }
  }

  // Cross-reference: check actions in triggers
  if (data.hotspots && Array.isArray(data.hotspots)) {
    for (const hs of data.hotspots) {
      if (!hs.triggers || !Array.isArray(hs.triggers)) continue;
      for (let ti = 0; ti < hs.triggers.length; ti++) {
        const trigger = hs.triggers[ti];
        if (!trigger.actions || !Array.isArray(trigger.actions)) continue;
        for (const action of trigger.actions) {
          if (action.type === 'giveItem' || action.type === 'removeItem') {
            if (action.params?.itemId && !itemIds.has(action.params.itemId)) {
              errors.push(`Hotspot ${hs.id} trigger[${ti}]: ${action.type} references undefined item "${action.params.itemId}"`);
            }
          }
          if (action.type === 'showHotspot' || action.type === 'hideHotspot') {
            if (action.params?.hotspotId && !hotspotIds.has(action.params.hotspotId)) {
              errors.push(`Hotspot ${hs.id} trigger[${ti}]: ${action.type} references undefined hotspot "${action.params.hotspotId}"`);
            }
          }
          if (action.type === 'triggerPuzzle') {
            if (action.params?.puzzleId && !puzzleIds.has(action.params.puzzleId)) {
              errors.push(`Hotspot ${hs.id} trigger[${ti}]: triggerPuzzle references undefined puzzle "${action.params.puzzleId}"`);
            }
          }
        }
      }
    }
  }

  // Item combining cross-references
  if (data.items && Array.isArray(data.items)) {
    for (const item of data.items) {
      if (item.combinesWith && !itemIds.has(item.combinesWith)) {
        errors.push(`Item ${item.id}: combinesWith references undefined item "${item.combinesWith}"`);
      }
      if (item.combineResult && !itemIds.has(item.combineResult)) {
        errors.push(`Item ${item.id}: combineResult references undefined item "${item.combineResult}"`);
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

export function validateRoomSet(data) {
  const errors = [];

  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['RoomSet data must be an object'] };
  }

  if (!data.id) errors.push('Missing required field: id');
  if (!data.startRoom) errors.push('Missing required field: startRoom');
  if (!Array.isArray(data.rooms) || data.rooms.length === 0) {
    errors.push('rooms must be a non-empty array');
  }

  return { valid: errors.length === 0, errors };
}
