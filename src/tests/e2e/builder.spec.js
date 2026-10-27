import { test, expect } from '@playwright/test';

test.describe('Builder', () => {
    test('loads with the welcome tag preview', async ({ page }) => {
        await page.goto('/');
        await expect(page.getByRole('heading', { name: 'Send a Virtual Keytag' })).toBeVisible();
        await expect(page.locator('.kt-headline')).toHaveText('Welcome');
        await expect(page.locator('img.kt-ring')).toBeVisible();
    });

    test('live preview updates with milestone and recipient', async ({ page }) => {
        await page.goto('/');
        await page.locator('input[type="text"]').first().fill('Sam R.');
        await page.locator('select').first().selectOption('1y');
        await expect(page.locator('.kt-headline')).toHaveText('1 Year');
        await expect(page.getByText('For Sam R.')).toBeVisible();
    });

    test('entering a clean date auto-picks the milestone', async ({ page }) => {
        await page.goto('/');
        await page.locator('input[type="date"]').fill('2025-10-26');
        // At least a year of clean time → not the welcome tag anymore
        await expect(page.locator('.kt-headline')).not.toHaveText('Welcome');
    });

    test('the tag image actually loads (paths resolve, not a broken image)', async ({ page }) => {
        await page.goto('/');
        const img = page.locator('img.kt-front');
        await expect(img).toBeVisible();
        const loaded = await img.evaluate((el) => el.complete && el.naturalWidth > 0);
        expect(loaded).toBe(true);
    });
});
