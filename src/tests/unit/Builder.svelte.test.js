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
        // Stub the anchor click so jsdom doesn't attempt a (download) navigation.
        const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
        render(Builder);
        await fireEvent.click(screen.getByRole('button', { name: 'Download image' }));
        expect(toPng).toHaveBeenCalled();
        click.mockRestore();
    });

    test('seeds the form from an initial payload (editing)', () => {
        const { container } = render(Builder, {
            props: { initial: { m: '07', to: 'Jo', msg: 'Just for Today', l: 'en' } },
        });
        expect(headline(container)).toBe('1 Year');
        expect(screen.getByText('For Jo')).toBeInTheDocument();
        expect(screen.getByText(/Editing this keytag/)).toBeInTheDocument();
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
