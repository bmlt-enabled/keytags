import { test } from '@playwright/test';
import { checkA11y, injectAxe } from 'axe-playwright';
import { cardPath, SAMPLE_CARD } from './helpers';

const AXE_OPTIONS = {
    axeOptions: {
        runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] },
    },
    detailedReport: true,
    detailedReportOptions: { html: true },
};

// Freeze transitions so axe's synchronous color-contrast scan never samples a
// mid-flip/mid-transition color.
const DISABLE_TRANSITIONS = `
  *, *::before, *::after {
    transition-duration: 0s !important;
    animation-duration: 0s !important;
  }
`;

async function scan(page, url) {
    await page.goto(url);
    await page.addStyleTag({ content: DISABLE_TRANSITIONS });
    await injectAxe(page);
    await checkA11y(page, undefined, AXE_OPTIONS);
}

test.describe('Accessibility', () => {
    test('builder has no violations', async ({ page }) => {
        await scan(page, '/');
    });

    test('recipient card has no violations', async ({ page }) => {
        await scan(page, cardPath(SAMPLE_CARD));
    });

    test('display view has no violations', async ({ page }) => {
        await scan(page, cardPath({ ...SAMPLE_CARD, v: 'display' }));
    });
});
