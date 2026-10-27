import { test, expect } from '@playwright/test';
import { cardPath, SAMPLE_CARD } from './helpers';

test.describe('Share round-trip', () => {
    test('a shared link renders the recipient card', async ({ page }) => {
        await page.goto(cardPath(SAMPLE_CARD));
        await expect(page.locator('.kt-headline')).toHaveText('1 Year');
        await expect(page.getByText('For Sam R.')).toBeVisible();
        await expect(page.getByText('“Just for Today”')).toBeVisible();
        await expect(page.getByText('— Pat')).toBeVisible();
    });

    test('open full screen → exit returns to the same card, not the builder', async ({
        page,
        context,
    }) => {
        await page.goto(cardPath(SAMPLE_CARD));

        // "Open full screen" opens the display view in a new tab.
        const [display] = await Promise.all([
            context.waitForEvent('page'),
            page.getByRole('button', { name: 'Open full screen' }).click(),
        ]);
        await expect(display.getByRole('heading', { name: '1 Year' })).toBeVisible();

        await display.getByRole('button', { name: 'Exit display view' }).click();

        // Back to the card view — the builder heading must NOT appear.
        await expect(display.locator('.kt-headline')).toHaveText('1 Year');
        await expect(display.getByRole('heading', { name: 'Send a Virtual Keytag' })).toHaveCount(
            0,
        );
    });

    test('"create your own" goes to the builder', async ({ page }) => {
        await page.goto(cardPath(SAMPLE_CARD));
        await page.getByRole('button', { name: /Create your own/ }).click();
        await expect(page.getByRole('heading', { name: 'Send a Virtual Keytag' })).toBeVisible();
    });

    test('the card view offers full-screen and create-your-own, but no edit', async ({ page }) => {
        await page.goto(cardPath(SAMPLE_CARD));
        await expect(page.getByRole('button', { name: 'Open full screen' })).toBeVisible();
        await expect(page.getByRole('button', { name: /Create your own/ })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Edit this keytag' })).toHaveCount(0);
    });

    test('a card localizes the whole UI to its language and sets <html lang> (finding #9)', async ({
        page,
    }) => {
        await page.goto(cardPath({ ...SAMPLE_CARD, l: 'es' }));
        await expect(page.locator('.kt-headline')).toHaveText('1 Año');
        await expect(page.getByText('Para Sam R.')).toBeVisible();
        // Chrome around the card is localized too, not just the card content.
        await expect(
            page.getByRole('button', { name: 'Abrir en pantalla completa' }),
        ).toBeVisible();
        await expect(page.locator('html')).toHaveAttribute('lang', 'es');
    });

    test('a corrupt fragment falls back to the builder', async ({ page }) => {
        await page.goto('/#not-a-valid-payload');
        await expect(page.getByRole('heading', { name: 'Send a Virtual Keytag' })).toBeVisible();
    });

    test('a long unbroken message does not overflow the viewport (finding #8)', async ({
        page,
    }) => {
        const longMsg = 'A'.repeat(180);
        await page.goto(cardPath({ ...SAMPLE_CARD, msg: longMsg }));
        await expect(page.getByText(`“${longMsg}”`)).toBeVisible();

        const { scrollWidth, innerWidth } = await page.evaluate(() => ({
            scrollWidth: document.documentElement.scrollWidth,
            innerWidth: window.innerWidth,
        }));
        // No horizontal page overflow (allow a 1px rounding slack).
        expect(scrollWidth).toBeLessThanOrEqual(innerWidth + 1);
    });
});
