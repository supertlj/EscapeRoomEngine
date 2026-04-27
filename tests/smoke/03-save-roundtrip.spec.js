import { test, expect } from '@playwright/test';

const SAVE_KEY = 'ere_save_cipher-1892';

test.describe('Save data round-trips', () => {
  test('refresh mid-game preserves chapter + room + flags', async ({ page }) => {
    await page.goto('/');
    await page.evaluate((k) => localStorage.removeItem(k), SAVE_KEY);

    // Boot apartment to get an initial save written
    await page.goto('/play.html?skipIntro=1#room=apartment');
    await expect(page.locator('#roomName')).toHaveText('The Apartment');

    // Inject some additional state directly into the saved blob
    // (simulates progress without having to solve the actual puzzle chain).
    await page.evaluate((k) => {
      const save = JSON.parse(localStorage.getItem(k));
      save.chapterFlags = save.chapterFlags || {};
      save.chapterFlags.c01 = save.chapterFlags.c01 || {};
      save.chapterFlags.c01.test_flag = true;
      save.inventory = ['keycard'];
      save.completedRooms = ['apartment'];
      localStorage.setItem(k, JSON.stringify(save));
    }, SAVE_KEY);

    // Refresh — StateManager.load() should hydrate cleanly.
    await page.reload();

    // Page is alive (no boot-time error overlay shown — DialogUI's hidden
    // overlay always exists in DOM with class "hidden", so we filter it).
    await expect(page.locator('.message-overlay:not(.hidden)')).toHaveCount(0);
    await expect(page.locator('#roomName')).toHaveText('The Apartment');

    // Save still has our injected state — and was re-written with the same shape
    const saveAfter = await page.evaluate((k) => JSON.parse(localStorage.getItem(k)), SAVE_KEY);

    expect(saveAfter.version).toBe(1);
    expect(saveAfter.gameId).toBe('cipher-1892');
    expect(saveAfter.chapterFlags?.c01?.test_flag).toBe(true);
    expect(saveAfter.inventory).toContain('keycard');
    expect(saveAfter.completedRooms).toContain('apartment');
  });
});
