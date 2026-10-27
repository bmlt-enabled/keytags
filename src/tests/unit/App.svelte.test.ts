import { describe, test, expect, afterEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import App from '../../App.svelte';
import { encodePayload, decodePayload } from '../../lib/encode';

afterEach(() => {
    window.location.hash = '';
});

describe('App routing by URL fragment', () => {
    test('no fragment shows the builder', () => {
        render(App);
        expect(screen.getByRole('heading', { name: 'Send a Virtual Keytag' })).toBeInTheDocument();
    });

    test('a card payload shows the recipient card', () => {
        window.location.hash = '#' + encodePayload({ m: '07', to: 'Sam R.', l: 'en' });
        const { container } = render(App);
        expect(
            screen.queryByRole('heading', { name: 'Send a Virtual Keytag' }),
        ).not.toBeInTheDocument();
        expect(container.querySelector('.kt-headline')!.textContent!.trim()).toBe('1 Year');
        expect(screen.getByRole('button', { name: /Create your own/ })).toBeInTheDocument();
    });

    test('a display payload shows the full-screen view', () => {
        window.location.hash =
            '#' + encodePayload({ m: '07', to: 'Sam R.', l: 'en', v: 'display' });
        render(App);
        expect(screen.getByRole('heading', { name: '1 Year' })).toBeInTheDocument();
        expect(screen.getByLabelText('Exit display view')).toBeInTheDocument();
    });

    test('exiting full-screen returns to the same keytag (not the builder)', async () => {
        window.location.hash =
            '#' + encodePayload({ m: '07', to: 'Sam R.', l: 'en', v: 'display' });
        render(App);
        await fireEvent.click(screen.getByLabelText('Exit display view'));
        const payload = decodePayload(window.location.hash);
        expect(payload).toMatchObject({ m: '07', to: 'Sam R.' });
        expect(payload!.v).toBeUndefined();
    });

    test('an edit payload reopens the builder pre-filled', () => {
        window.location.hash = '#' + encodePayload({ m: '07', to: 'Sam R.', l: 'en', v: 'edit' });
        const { container } = render(App);
        expect(screen.getByRole('heading', { name: 'Send a Virtual Keytag' })).toBeInTheDocument();
        expect(screen.getByText(/Editing this keytag/)).toBeInTheDocument();
        expect(container.querySelector('.kt-headline')!.textContent!.trim()).toBe('1 Year');
        expect(screen.getByText('For Sam R.')).toBeInTheDocument();
    });

    test('card view: "Edit this keytag" switches the fragment to edit mode', async () => {
        window.location.hash = '#' + encodePayload({ m: '07', to: 'Sam R.', l: 'en' });
        render(App);
        await fireEvent.click(screen.getByRole('button', { name: 'Edit this keytag' }));
        expect(decodePayload(window.location.hash)).toMatchObject({ m: '07', v: 'edit' });
    });

    test('card view: open full screen opens a tab, create-your-own clears the card', async () => {
        const open = vi.spyOn(window, 'open').mockImplementation(() => null);
        window.location.hash = '#' + encodePayload({ m: '07', to: 'Sam R.', l: 'en' });
        render(App);
        await fireEvent.click(screen.getByRole('button', { name: 'Open full screen' }));
        expect(open).toHaveBeenCalled();
        open.mockRestore();

        await fireEvent.click(screen.getByRole('button', { name: /Create your own/ }));
        expect(window.location.hash).toBe('');
    });
});
