import { test, expect } from '@playwright/test';

test.describe('Game Filtering', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('game-filters')).toBeVisible();
  });

  test('should filter by category', async ({ page }) => {
    const total = await page.getByTestId('game-card').count();
    const checkbox = page.locator('[data-testid^="filter-category-"]').first();
    await checkbox.check({ force: true });
    const categoryId = await checkbox.getAttribute('value');

    const visible = page.locator('[data-testid="game-card"]:visible');
    expect(await visible.count()).toBeLessThan(total);
    for (const card of await visible.all()) {
      await expect(card).toHaveAttribute('data-category-id', categoryId!);
    }
  });

  test('should filter by publisher and combine with category', async ({ page }) => {
    const select = page.getByTestId('filter-publisher');
    await select.selectOption({ index: 1 });
    const publisherId = await select.inputValue();
    const visible = page.locator('[data-testid="game-card"]:visible');
    for (const card of await visible.all()) {
      await expect(card).toHaveAttribute('data-publisher-id', publisherId);
    }
    const publisherCount = await visible.count();

    await page.locator('[data-testid^="filter-category-"]').first().check({ force: true });
    expect(await visible.count()).toBeLessThanOrEqual(publisherCount);
  });

  test('should show empty state when nothing matches and restore on clear', async ({ page }) => {
    const total = await page.getByTestId('game-card').count();
    const checkboxes = page.locator('[data-testid^="filter-category-"]');
    const publisherCount = await page.getByTestId('filter-publisher').locator('option').count();
    const visible = page.locator('[data-testid="game-card"]:visible');

    let empty = false;
    for (let p = 1; p < publisherCount && !empty; p++) {
      for (let c = 0; c < (await checkboxes.count()) && !empty; c++) {
        await page.getByTestId('filter-publisher').selectOption({ index: p });
        await checkboxes.nth(c).check({ force: true });
        empty = (await visible.count()) === 0;
        if (!empty) await page.getByTestId('filter-clear').click();
      }
    }
    if (empty) await expect(page.getByTestId('no-results')).toBeVisible();

    await page.getByTestId('filter-clear').click();
    await expect(visible).toHaveCount(total);
    await expect(page.getByTestId('filter-count')).toHaveText(`Showing ${total} of ${total} games`);
  });

  test('should be keyboard accessible', async ({ page }) => {
    const checkbox = page.locator('[data-testid^="filter-category-"]').first();
    await checkbox.focus();
    await page.keyboard.press('Space');
    await expect(checkbox).toBeChecked();
  });
});
