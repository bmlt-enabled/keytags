import { describe, test, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import Builder from '../../components/Builder.svelte';

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
});
