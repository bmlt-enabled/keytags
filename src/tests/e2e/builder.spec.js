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

    // Regression for the cross-engine PNG export bug: the downloaded image must
    // actually contain the rendered tag, not a blank/near-empty canvas (WebKit
    // previously omitted the tag, Chromium mirrored it). We capture the exact
    // data URL the app generates and decode it in-page to inspect real pixels.
    test('exported PNG contains the rendered tag, not a blank image', async ({ page }) => {
        await page.goto('/');
        await page.locator('select').first().selectOption('1y');
        // Wait for the preview tag face to finish loading before exporting.
        await expect
            .poll(() =>
                page.locator('img.kt-front').evaluate((el) => el.complete && el.naturalWidth > 0),
            )
            .toBe(true);

        // Capture the generated data URL instead of letting it download.
        await page.evaluate(() => {
            window.__pngHref = null;
            const orig = HTMLAnchorElement.prototype.click;
            HTMLAnchorElement.prototype.click = function () {
                if (this.download && String(this.href).startsWith('data:image/png')) {
                    window.__pngHref = this.href;
                    return;
                }
                return orig.apply(this, arguments);
            };
        });

        await page.getByRole('button', { name: 'Download image' }).click();
        await expect.poll(() => page.evaluate(() => window.__pngHref)).not.toBeNull();

        const stats = await page.evaluate(async () => {
            const href = window.__pngHref;
            const img = new Image();
            await new Promise((res, rej) => {
                img.onload = res;
                img.onerror = rej;
                img.src = href;
            });
            const canvas = document.createElement('canvas');
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            const { data, width, height } = ctx.getImageData(0, 0, canvas.width, canvas.height);
            // Treat the top-left pixel as the background, then count how much of
            // the image differs from it — the tag, ring and text.
            const [br, bg_, bb] = [data[0], data[1], data[2]];
            let differing = 0;
            const total = width * height;
            for (let i = 0; i < data.length; i += 4) {
                const d =
                    Math.abs(data[i] - br) +
                    Math.abs(data[i + 1] - bg_) +
                    Math.abs(data[i + 2] - bb);
                if (d > 40) differing++;
            }
            return { width, height, ratio: differing / total };
        });

        expect(stats.width).toBeGreaterThan(100);
        expect(stats.height).toBeGreaterThan(100);
        // A correctly rendered tag + caption covers a large share of the frame;
        // the broken exports were essentially uniform (ratio ≈ 0).
        expect(stats.ratio).toBeGreaterThan(0.15);
    });
});
