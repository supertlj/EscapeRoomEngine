import EventBus from '../core/EventBus.js';

/**
 * Handles image uploads, converting to data URLs for portable JSON.
 * Also preloads images into HTMLImageElement for rendering.
 */
export default class AssetManager {
  constructor() {
    this._imageCache = new Map(); // dataUrl -> HTMLImageElement
  }

  /**
   * Open a file picker and return a data URL for the selected image.
   * @returns {Promise<{dataUrl: string, img: HTMLImageElement}>}
   */
  pickImage() {
    return new Promise((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = () => {
        const file = input.files[0];
        if (!file) { reject(new Error('No file selected')); return; }
        this._readAsDataUrl(file).then(resolve).catch(reject);
      };
      input.click();
    });
  }

  /**
   * Read a File as a data URL and preload the image.
   * @param {File} file
   * @returns {Promise<{dataUrl: string, img: HTMLImageElement}>}
   */
  _readAsDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result;
        this.loadImage(dataUrl).then(img => {
          resolve({ dataUrl, img });
        }).catch(reject);
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }

  /**
   * Load an image from a URL (data URL or regular URL) and cache it.
   * @param {string} src
   * @returns {Promise<HTMLImageElement>}
   */
  loadImage(src) {
    if (!src) return Promise.resolve(null);
    if (this._imageCache.has(src)) {
      return Promise.resolve(this._imageCache.get(src));
    }
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this._imageCache.set(src, img);
        resolve(img);
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = src;
    });
  }

  /**
   * Get a cached image or null.
   * @param {string} src
   * @returns {HTMLImageElement|null}
   */
  getCached(src) {
    return this._imageCache.get(src) || null;
  }

  /**
   * Preload all images referenced in a room (background + hotspot images).
   * @param {import('../core/RoomData.js').Room} room
   * @returns {Promise<void>}
   */
  async preloadRoom(room) {
    const promises = [];

    if (room.background.type === 'image' && room.background.value) {
      promises.push(this.loadImage(room.background.value).then(img => {
        room.background._img = img;
      }).catch(() => {}));
    }

    for (const hs of room.hotspots) {
      if (hs.appearance.image) {
        promises.push(this.loadImage(hs.appearance.image).then(img => {
          hs.appearance._img = img;
        }).catch(() => {}));
      }
    }

    await Promise.all(promises);
  }
}
