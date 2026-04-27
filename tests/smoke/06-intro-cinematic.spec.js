import { test, expect } from '@playwright/test';

const SAVE_KEY = 'ere_save_cipher-1892';

test.describe('Intro cinematic gate', () => {
  test('plays for first-time players and is skippable', async ({ page }) => {
    await page.goto('/');
    await page.evaluate((k) => localStorage.removeItem(k), SAVE_KEY);

    // First-time visit — cinematic should appear, room shouldn't render yet.
    await page.goto('/play.html#room=apartment');
    const overlay = page.locator('.cinematic-overlay');
    await expect(overlay).toBeVisible({ timeout: 10_000 });

    // First scene caption should appear after its delayIn (1.4s)
    await expect(page.locator('.cm-caption').first()).toContainText(/SAM REYES/i, { timeout: 5_000 });

    // Skip button is present and clickable
    const skip = page.locator('.cm-skip');
    await expect(skip).toBeVisible();
    await skip.click();

    // Overlay tears down
    await expect(overlay).toHaveCount(0, { timeout: 3_000 });

    // settings.introSeen flipped true and saved
    const introSeen = await page.evaluate((k) => {
      const raw = localStorage.getItem(k);
      return raw ? JSON.parse(raw).settings?.introSeen : null;
    }, SAVE_KEY);
    expect(introSeen).toBe(true);

    // Room loads after the cinematic
    await expect(page.locator('#roomName')).toHaveText('The Apartment');
  });

  test('returning visitor (introSeen=true) bypasses the cinematic', async ({ page }) => {
    await page.goto('/');

    // Plant a save with introSeen=true
    await page.evaluate((k) => {
      const blob = {
        version: 1,
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
        settings: { bgmVolume: 0.7, sfxVolume: 0.9, muted: false, introSeen: true },
        meta: { createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
      };
      localStorage.setItem(k, JSON.stringify(blob));
    }, SAVE_KEY);

    await page.goto('/play.html#room=apartment');

    // Cinematic should NOT appear; apartment loads directly
    await expect(page.locator('#roomName')).toHaveText('The Apartment');
    await expect(page.locator('.cinematic-overlay')).toHaveCount(0);
  });

  test('?skipIntro=1 always bypasses the cinematic', async ({ page }) => {
    await page.goto('/');
    await page.evaluate((k) => localStorage.removeItem(k), SAVE_KEY);

    await page.goto('/play.html?skipIntro=1#room=apartment');

    await expect(page.locator('#roomName')).toHaveText('The Apartment');
    await expect(page.locator('.cinematic-overlay')).toHaveCount(0);
  });
});
