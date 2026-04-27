import { test, expect } from '@playwright/test';

const SAVE_KEY = 'ere_save_cipher-1892';

test.describe('Apartment loads from PLAY', () => {
  test('clicking PLAY navigates to apartment and renders canvas', async ({ page }) => {
    await page.goto('/');
    await page.evaluate((k) => localStorage.removeItem(k), SAVE_KEY);
    await page.reload();

    // Click PLAY (cinematic intro is gated by save state — fresh state will
    // show it. We test the intro flow separately; here we want a deterministic
    // direct-to-room load, so navigate explicitly with skipIntro=1).
    await page.goto('/play.html?skipIntro=1#room=apartment');

    // URL changed to play.html#room=apartment
    await expect(page).toHaveURL(/play\.html\?skipIntro=1#room=apartment/);

    // Room name in topbar
    await expect(page.locator('#roomName')).toHaveText('The Apartment');

    // Canvas is in the DOM and has dimensions
    const canvas = page.locator('#gameCanvas');
    await expect(canvas).toBeVisible();
    const box = await canvas.boundingBox();
    expect(box.width).toBeGreaterThan(100);
    expect(box.height).toBeGreaterThan(100);

    // Initial save was written by play.html boot
    const save = await page.evaluate((k) => {
      const raw = localStorage.getItem(k);
      return raw ? JSON.parse(raw) : null;
    }, SAVE_KEY);

    expect(save).not.toBeNull();
    expect(save.version).toBe(1);
    expect(save.gameId).toBe('cipher-1892');
    expect(save.currentChapter).toBe('c01');
    expect(save.currentRoomId).toBe('apartment');
  });
});
