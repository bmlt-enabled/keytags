import { describe, test, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import KeytagCard from '../../components/KeytagCard.svelte';

const card = {
    lang: 'en',
    official: false,
    showSpecial: false,
    tag: { num: '07', years: null },
    headline: '1 Year',
    timeText: { days: '', main: 'This is 1 year.' },
    to: 'Sam R.',
    from: 'Pat',
    msg: 'Proud of you.',
};

describe('KeytagCard', () => {
    test('renders headline, recipient, message and sender', () => {
        render(KeytagCard, { props: { card, intro: false } });
        expect(screen.getByText('1 Year')).toBeInTheDocument();
        expect(screen.getByText('For Sam R.')).toBeInTheDocument();
        expect(screen.getByText('“Proud of you.”')).toBeInTheDocument();
        expect(screen.getByText('— Pat')).toBeInTheDocument();
        expect(screen.getByText('This is 1 year.')).toBeInTheDocument();
    });

    test('renders generic front + back faces', () => {
        const { container } = render(KeytagCard, { props: { card, intro: false } });
        const faces = container.querySelectorAll('img.kt-face');
        expect(faces).toHaveLength(2);
        // generic mode: front uses the plain (back) image, not _Front
        expect(faces[0].getAttribute('src')).toMatch(/images\/en\/07\.png$/);
    });

    test('click flips the tag', async () => {
        const { container } = render(KeytagCard, { props: { card, intro: false } });
        const stage = container.querySelector('.kt-stage');
        expect(stage).not.toHaveClass('flipped');
        await fireEvent.click(stage);
        expect(stage).toHaveClass('flipped');
    });

    test('Enter key flips the tag', async () => {
        const { container } = render(KeytagCard, { props: { card, intro: false } });
        const stage = container.querySelector('.kt-stage');
        await fireEvent.keyDown(stage, { key: 'Enter' });
        expect(stage).toHaveClass('flipped');
    });

    test('intro reveals the reading, then settles back to the front', async () => {
        vi.useFakeTimers();
        try {
            const { container } = render(KeytagCard, { props: { card, intro: true } });
            const stage = container.querySelector('.kt-stage');
            expect(stage).not.toHaveClass('flipped');
            await vi.advanceTimersByTimeAsync(1300);
            expect(stage).toHaveClass('flipped');
            await vi.advanceTimersByTimeAsync(2600);
            expect(stage).not.toHaveClass('flipped');
        } finally {
            vi.useRealTimers();
        }
    });

    test('hides caption text when showText is false', () => {
        render(KeytagCard, { props: { card, intro: false, showText: false } });
        expect(screen.queryByText('1 Year')).not.toBeInTheDocument();
    });

    test('flat mode renders a single front face with no rotated back', () => {
        const { container } = render(KeytagCard, { props: { card, intro: false, flat: true } });
        expect(container.querySelector('.kt')).toHaveClass('flat');
        const faces = container.querySelectorAll('img.kt-face');
        expect(faces).toHaveLength(1);
        expect(container.querySelector('.kt-back')).toBeNull();
        // The front face is still the real tag image, and the caption remains.
        expect(faces[0].getAttribute('src')).toMatch(/images\/en\/07\.png$/);
        expect(screen.getByText('1 Year')).toBeInTheDocument();
    });
});
