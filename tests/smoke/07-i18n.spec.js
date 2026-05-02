import { test, expect } from '@playwright/test';

const SAVE_KEY = 'ere_save_cipher-1892';

/**
 * I18n verification.
 *
 * Boot test pins the locale via the save's settings.locale field.
 * navigator.language emulation is browser-context-level which is
 * heavier; using save.settings.locale is the documented user-controlled
 * path and exercises the same code path as a Settings UI toggle would.
 */
test.describe('I18n — locale switching', () => {
  test('English (default) renders English UI strings', async ({ page }) => {
    await page.goto('/');
    await page.evaluate((k) => localStorage.removeItem(k), SAVE_KEY);
    await page.reload();

    // Brand title is identical across locales (it's a name).
    await expect(page.locator('h1')).toHaveText('Cipher 1892');
    // Subtitle is localized.
    await expect(page.locator('.subtitle')).toHaveText('Escape Room Mystery');
    // Primary CTA copy.
    await expect(page.locator('#hub-play')).toHaveText(/PLAY/);
    // Chapter card label.
    await expect(page.locator('.room-card', { hasText: 'Chapter 1: Awakening' })).toBeVisible();
    await expect(page.locator('.badge.released')).toContainText('Available');
  });

  test('Chinese (zh-CN) renders translated UI strings', async ({ page }) => {
    // Plant a save with locale pinned to zh-CN so I18n boot picks it up.
    await page.goto('/');
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
        settings: { bgmVolume: 0.7, sfxVolume: 0.9, muted: false, introSeen: true, locale: 'zh-CN' },
        meta: { createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
      };
      localStorage.setItem(k, JSON.stringify(blob));
    }, SAVE_KEY);
    await page.reload();

    // Subtitle: 密室解谜悬疑
    await expect(page.locator('.subtitle')).toHaveText('密室解谜悬疑');
    // CONTINUE button: 继续游戏 (because save has currentRoomId set)
    await expect(page.locator('#hub-play')).toContainText('继续游戏');
    // Chapter title localized
    await expect(page.locator('.room-card').first()).toContainText('苏醒');
    // Available badge localized
    await expect(page.locator('.badge.released')).toContainText('可游玩');
  });

  test('Cinematic captions render in Chinese when locale=zh-CN', async ({ page }) => {
    await page.goto('/');
    await page.evaluate((k) => {
      const blob = {
        version: 1, gameId: 'cipher-1892', currentChapter: 'c01', currentRoomId: 'apartment',
        completedChapters: [], completedRooms: [], inventory: [],
        chapterFlags: {}, globalFlags: {}, choices: {},
        puzzleAttempts: {}, firedOnceTriggers: [], patternProgress: {}, hotspotVisibility: {},
        timerRemaining: 0, hintsUsed: 0,
        // introSeen=false so the cinematic plays
        settings: { bgmVolume: 0.7, sfxVolume: 0.9, muted: false, introSeen: false, locale: 'zh-CN' },
        meta: { createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
      };
      localStorage.setItem(k, JSON.stringify(blob));
    }, SAVE_KEY);

    await page.goto('/play.html#room=apartment');
    await expect(page.locator('.cinematic-overlay')).toBeVisible({ timeout: 8_000 });
    // First scene's caption should be Chinese
    await expect(page.locator('.cm-caption').first()).toContainText('山姆·雷耶斯', { timeout: 5_000 });
    // Skip button localized
    await expect(page.locator('.cm-skip')).toContainText('跳过');
  });

  test('Hub language picker switches locale + persists in save', async ({ page }) => {
    await page.goto('/');
    await page.evaluate((k) => localStorage.removeItem(k), SAVE_KEY);
    await page.reload();

    // Default: English
    await expect(page.locator('.subtitle')).toHaveText('Escape Room Mystery');

    // Picker is present + showing English as selected
    const select = page.locator('#hub-language-select');
    await expect(select).toBeVisible();
    await expect(select).toHaveValue('en');

    // Switch to Chinese
    await select.selectOption('zh-CN');
    // Reload happens automatically; wait for hub to re-render in Chinese
    await expect(page.locator('.subtitle')).toHaveText('密室解谜悬疑', { timeout: 5_000 });
    await expect(page.locator('#hub-language-select')).toHaveValue('zh-CN');

    // Save has the locale persisted
    const locale = await page.evaluate((k) => {
      const raw = localStorage.getItem(k);
      return raw ? JSON.parse(raw)?.settings?.locale : null;
    }, SAVE_KEY);
    expect(locale).toBe('zh-CN');

    // Switch back to English to verify round-trip
    await page.locator('#hub-language-select').selectOption('en');
    await expect(page.locator('.subtitle')).toHaveText('Escape Room Mystery', { timeout: 5_000 });
    const localeBack = await page.evaluate((k) => JSON.parse(localStorage.getItem(k))?.settings?.locale, SAVE_KEY);
    expect(localeBack).toBe('en');
  });

  test('End screen renders in Chinese when locale=zh-CN', async ({ page }) => {
    await page.goto('/');
    await page.evaluate((k) => {
      const blob = {
        version: 1, gameId: 'cipher-1892', currentChapter: 'c01', currentRoomId: 'apartment',
        completedChapters: [], completedRooms: [], inventory: [],
        chapterFlags: {}, globalFlags: {}, choices: {},
        puzzleAttempts: {}, firedOnceTriggers: [], patternProgress: {}, hotspotVisibility: {},
        timerRemaining: 0, hintsUsed: 0,
        settings: { bgmVolume: 0.7, sfxVolume: 0.9, muted: false, introSeen: true, locale: 'zh-CN' },
        meta: { createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
      };
      localStorage.setItem(k, JSON.stringify(blob));
    }, SAVE_KEY);

    await page.goto('/play.html?debug=1&skipIntro=1#room=apartment');
    await page.waitForFunction(() => window._cipher && typeof window._cipher.showEndScreen === 'function');
    await page.evaluate(() => window._cipher.showEndScreen());

    await expect(page.locator('.es-line-1')).toHaveText('他还活着。');
    await expect(page.locator('.es-line-2')).toContainText('不在你这一边');
    await expect(page.locator('#es-replay')).toContainText('重玩本章');
    await expect(page.locator('#es-hub')).toContainText('返回主菜单');
  });
});
