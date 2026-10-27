import { describe, test, expect, afterEach } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import App from '../../App.svelte';
import { encodePayload } from '../../lib/encode.js';

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
        expect(screen.queryByRole('heading', { name: 'Send a Virtual Keytag' })).not.toBeInTheDocument();
        expect(container.querySelector('.kt-headline').textContent.trim()).toBe('1 Year');
        expect(screen.getByRole('button', { name: /Create your own/ })).toBeInTheDocument();
    });

    test('a display payload shows the full-screen view', () => {
        window.location.hash = '#' + encodePayload({ m: '07', to: 'Sam R.', l: 'en', v: 'display' });
        render(App);
        expect(screen.getByRole('heading', { name: '1 Year' })).toBeInTheDocument();
        expect(screen.getByLabelText('Exit display view')).toBeInTheDocument();
    });
});
