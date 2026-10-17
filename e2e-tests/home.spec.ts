import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display the correct title', async ({ page }) => {
    // Check that the page title is correct
    await expect(page).toHaveTitle('Tailspin Toys - Crowdfunding your new favorite game!');
  });

  test('should display the main heading', async ({ page }) => {
    // Check that the main page heading is present
    await expect(page.getByRole('heading', { name: 'Welcome to Tailspin Toys', exact: true })).toBeVisible();
  });

  test('should display the site branding in header', async ({ page }) => {
    // Check that the site branding is present in the header (no longer an h1)
    await expect(page.getByText('Tailspin Toys').first()).toBeVisible();
  });

  test('should display the welcome message', async ({ page }) => {
    // Check that the welcome message is present using more specific locator
    await expect(page.getByText('Find your next game! And maybe even back one! Explore our collection!')).toBeVisible();
  });
});

test.describe('Home Page game card ratings', () => {
  test('every game card shows a rating or the no-rating placeholder', async ({ page }) => {
    await page.goto('/');
    const cards = page.getByTestId('game-card');
    await expect(cards.first()).toBeVisible();
    for (const card of await cards.all()) {
      await expect(card.getByTestId('game-card-rating')).toHaveText(/^(★ \d\.\d \/ 5|No rating yet)$/);
    }
  });
});
