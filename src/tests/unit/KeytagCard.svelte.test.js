import { describe, test, expect } from 'vitest';
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

    test('hides caption text when showText is false', () => {
        render(KeytagCard, { props: { card, intro: false, showText: false } });
        expect(screen.queryByText('1 Year')).not.toBeInTheDocument();
    });
});
