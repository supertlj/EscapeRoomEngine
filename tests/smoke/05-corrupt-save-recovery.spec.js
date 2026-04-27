import { test, expect } from '@playwright/test';

const SAVE_KEY = 'ere_save_cipher-1892';

test.describe('Corrupt save shows recovery UI', () => {
  test('malformed JSON in localStorage surfaces a Reset Save Data button', async ({ page }) => {
    await page.goto('/');

    // Plant a corrupt save blob
    await page.evaluate((k) => {
      localStorage.setItem(k, '{this is not valid JSON');
    }, SAVE_KEY);

    // Boot the play page — StateManager.load() should throw SaveCorruptError,
    // which the boot handler catches and surfaces with a Reset button.
    await page.goto('/play.html#room=apartment');

    // Recovery dialog visible
    const overlay = page.locator('.message-overlay:not(.hidden)').last();
    await expect(overlay).toBeVisible();
    await expect(overlay).toContainText(/corrupt/i);
    await expect(overlay).toContainText(/Reset Save Data/i);
  });

  test('save with newer version shows refresh prompt', async ({ page }) => {
    await page.goto('/');

    // Plant a save with version higher than current (1)
    await page.evaluate((k) => {
      const blob = {
        version: 999,
        gameId: 'cipher-1892',
        currentChapter: 'c01',
        currentRoomId: 'apartment',
        completedChapters: [],
        completedRooms: [],
        inventory: [],
        chapterFlags: {},
        globalFlags: {},
        choices: {},
        puzzleAttempts: {},
        firedOnceTriggers: [],
        patternProgress: {},
        hotspotVisibility: {},
        timerRemaining: 0,
        hintsUsed: 0,
        settings: { bgmVolume: 0.7, sfxVolume: 0.9, muted: false, introSeen: false },
        meta: { createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
      };
      localStorage.setItem(k, JSON.stringify(blob));
    }, SAVE_KEY);

    await page.goto('/play.html#room=apartment');

    const overlay = page.locator('.message-overlay:not(.hidden)').last();
    await expect(overlay).toBeVisible();
    await expect(overlay).toContainText(/newer version/i);
    await expect(overlay).toContainText(/Refresh/i);
  });
});
