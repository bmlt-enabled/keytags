import { describe, test, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import Builder from '../../components/Builder.svelte';

vi.mock('html-to-image', () => ({
    toPng: vi.fn().mockResolvedValue('data:image/png;base64,AAAA'),
}));

const headline = (container) => container.querySelector('.kt-headline').textContent.trim();

describe('Builder', () => {
    test('renders the form and actions', () => {
        render(Builder);
        expect(screen.getByRole('heading', { name: 'Send a Virtual Keytag' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Copy share link' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Download image' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Open display view' })).toBeInTheDocument();
    });

    test('default preview is the welcome tag', () => {
        const { container } = render(Builder);
        expect(headline(container)).toBe('Welcome');
    });

    test('choosing a milestone updates the live preview', async () => {
        const { container } = render(Builder);
        const milestone = container.querySelectorAll('select')[0];
        await fireEvent.change(milestone, { target: { value: '1y' } });
        expect(headline(container)).toBe('1 Year');
    });

    test('typing a recipient name shows it on the preview', async () => {
        const { container } = render(Builder);
        const recipient = container.querySelector('input[type="text"]');
        await fireEvent.input(recipient, { target: { value: 'Jo' } });
        expect(screen.getByText('For Jo')).toBeInTheDocument();
    });

    test('copy share link writes a fragment URL to the clipboard', async () => {
        const writeText = vi.fn().mockResolvedValue(undefined);
        Object.assign(navigator, { clipboard: { writeText } });
        render(Builder);
        await fireEvent.click(screen.getByRole('button', { name: 'Copy share link' }));
        expect(writeText).toHaveBeenCalledOnce();
        expect(writeText.mock.calls[0][0]).toContain('#');
        expect(await screen.findByRole('button', { name: 'Copied!' })).toBeInTheDocument();
    });

    test('copy failure reveals a manual-copy fallback link (finding #10)', async () => {
        const writeText = vi.fn().mockRejectedValue(new Error('clipboard blocked'));
        Object.assign(navigator, { clipboard: { writeText } });
        render(Builder);
        await fireEvent.click(screen.getByRole('button', { name: 'Copy share link' }));
        const fallback = await screen.findByLabelText('Share link (copy manually)');
        expect(fallback.value).toContain('#');
        // The button does not falsely report success.
        expect(screen.queryByRole('button', { name: 'Copied!' })).not.toBeInTheDocument();
    });

    test('open display view opens a new tab with the display payload', async () => {
        const open = vi.spyOn(window, 'open').mockImplementation(() => null);
        render(Builder);
        await fireEvent.click(screen.getByRole('button', { name: 'Open display view' }));
        expect(open).toHaveBeenCalled();
        expect(open.mock.calls[0][0]).toContain('#');
        open.mockRestore();
    });

    test('download image renders the card to a PNG', async () => {
        const { toPng } = await import('html-to-image');
        toPng.mockClear();
        // Stub the anchor click so jsdom doesn't attempt a (download) navigation.
        const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
        render(Builder);
        await fireEvent.click(screen.getByRole('button', { name: 'Download image' }));
        // The export path now awaits image decode/fonts before capturing.
        await vi.waitFor(() => expect(toPng).toHaveBeenCalled());

        // It must capture the flat export node (single face, no rotated back),
        // not the interactive 3D preview — the fix for cross-engine PNG export.
        // (The node is detached again once the capture resolves, so assert on
        // its structure directly rather than document attachment.)
        const captured = toPng.mock.calls[0][0];
        expect(captured).toHaveClass('export-capture');
        expect(captured.querySelector('.kt')).toHaveClass('flat');
        expect(captured.querySelector('.kt-front')).not.toBeNull();
        expect(captured.querySelector('.kt-back')).toBeNull();
        click.mockRestore();
    });

    test('a failed export shows an error and re-enables the button (finding #10)', async () => {
        const { toPng } = await import('html-to-image');
        toPng.mockRejectedValueOnce(new Error('export failed'));
        render(Builder);
        const button = screen.getByRole('button', { name: 'Download image' });
        await fireEvent.click(button);
        expect(await screen.findByText(/image couldn't be created/i)).toBeInTheDocument();
        // Button returns to its normal, enabled state so the user can retry.
        expect(screen.getByRole('button', { name: 'Download image' })).toBeEnabled();
    });

    test('the flat export node is only mounted during capture', () => {
        const { container } = render(Builder);
        // Normally absent, so it never duplicates the preview's text/headline.
        expect(container.querySelector('.export-capture')).toBeNull();
        expect(container.querySelectorAll('.kt-headline')).toHaveLength(1);
    });

    test('seeds the form from an initial payload (editing)', () => {
        const { container } = render(Builder, {
            props: { initial: { m: '07', to: 'Jo', msg: 'Just for Today', l: 'en' } },
        });
        expect(headline(container)).toBe('1 Year');
        expect(screen.getByText('For Jo')).toBeInTheDocument();
        expect(screen.getByText(/Editing this keytag/)).toBeInTheDocument();
    });

    test('a clean date beyond 50 years shows the milestone, not Welcome (finding #4)', async () => {
        vi.useFakeTimers().setSystemTime(new Date(2026, 9, 26));
        try {
            const { container } = render(Builder);
            const dateInput = container.querySelector('input[type="date"]');
            await fireEvent.input(dateInput, { target: { value: '1975-10-26' } });
            expect(headline(container)).toBe('51 Years');
        } finally {
            vi.useRealTimers();
        }
    });

    test('editing preserves the saved milestone rather than re-deriving it (finding #6)', () => {
        vi.useFakeTimers().setSystemTime(new Date(2026, 9, 26));
        try {
            // Saved as "1 Year" with a date that is now 2 years old.
            const { container } = render(Builder, {
                props: { initial: { m: '07', d: '2024-10-26', l: 'en' } },
            });
            expect(headline(container)).toBe('1 Year');
        } finally {
            vi.useRealTimers();
        }
    });

    test('changing the date after an edit load does re-derive the milestone', async () => {
        vi.useFakeTimers().setSystemTime(new Date(2026, 9, 26));
        try {
            const { container } = render(Builder, {
                props: { initial: { m: '07', d: '2024-10-26', l: 'en' } },
            });
            expect(headline(container)).toBe('1 Year');
            const dateInput = container.querySelector('input[type="date"]');
            await fireEvent.input(dateInput, { target: { value: '2020-10-26' } });
            expect(headline(container)).toBe('6 Years');
        } finally {
            vi.useRealTimers();
        }
    });

    test('start over clears the form and calls onreset', async () => {
        const onreset = vi.fn();
        const { container } = render(Builder, {
            props: { initial: { m: '07', to: 'Jo', l: 'en' }, onreset },
        });
        expect(headline(container)).toBe('1 Year');
        await fireEvent.click(screen.getByRole('button', { name: 'Start over' }));
        expect(headline(container)).toBe('Welcome');
        expect(screen.queryByText('For Jo')).not.toBeInTheDocument();
        expect(onreset).toHaveBeenCalledOnce();
    });
});
