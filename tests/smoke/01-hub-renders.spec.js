import { test, expect } from '@playwright/test';

const SAVE_KEY = 'ere_save_cipher-1892';

test.describe('Hub renders', () => {
  test('boots without console errors and shows the title + chapter list', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (err) => errors.push(err.message));
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await page.goto('/');
    // Clear any prior save before assertions so we get the fresh-state hub.
    await page.evaluate((k) => localStorage.removeItem(k), SAVE_KEY);
    await page.reload();

    // Title — pulled from chapter index manifest's game.title
    await expect(page.locator('h1')).toHaveText('Cipher 1892');

    // Subtitle
    await expect(page.locator('.subtitle')).toContainText(/Escape Room Mystery/i);

    // Released chapter visible
    await expect(page.locator('.room-card', { hasText: 'Chapter 1: Awakening' })).toBeVisible();
    await expect(page.locator('.badge.released')).toContainText(/Available/i);

    // Coming-soon placeholder visible
    await expect(page.locator('.room-card', { hasText: 'Chapter 2: The Trail' })).toBeVisible();
    await expect(page.locator('.badge.soon')).toContainText(/Coming soon/i);

    // PLAY button (no save state)
    await expect(page.locator('#hub-play')).toBeVisible();
    await expect(page.locator('#hub-play')).toHaveText(/PLAY/);

    // No errors
    expect(errors).toEqual([]);
  });
});
