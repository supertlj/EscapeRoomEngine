import { test, expect } from '@playwright/test';

const SAVE_KEY = 'ere_save_cipher-1892';

test.describe('End screen triggers correctly', () => {
  test('debug shortcut shows the cliffhanger overlay with chapter teaser', async ({ page }) => {
    await page.goto('/');
    await page.evaluate((k) => localStorage.removeItem(k), SAVE_KEY);

    // Boot apartment with debug=1 so window._cipher is exposed
    await page.goto('/play.html?debug=1&skipIntro=1#room=apartment');
    await expect(page.locator('#roomName')).toHaveText('The Apartment');

    // Wait for the debug shortcut to be registered
    await page.waitForFunction(() => window._cipher && typeof window._cipher.showEndScreen === 'function');

    // Trigger the end screen
    await page.evaluate(() => window._cipher.showEndScreen());

    // Overlay rendered
    const overlay = page.locator('.end-screen-overlay');
    await expect(overlay).toBeVisible();

    // Cliffhanger lines present
    await expect(page.locator('.es-line-1')).toHaveText("He's alive.");
    await expect(page.locator('.es-line-2')).toHaveText(/not on your side/i);

    // Next chapter teaser
    await expect(page.locator('.es-teaser-label')).toContainText(/CHAPTER 2/);

    // Action buttons present
    await expect(page.locator('#es-replay')).toBeVisible();
    await expect(page.locator('#es-hub')).toBeVisible();
  });
});
