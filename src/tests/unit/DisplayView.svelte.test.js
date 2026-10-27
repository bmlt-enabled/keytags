import { describe, test, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import DisplayView from '../../components/DisplayView.svelte';

const card = {
    lang: 'en',
    official: false,
    showSpecial: false,
    tag: { num: '09', years: 5 },
    headline: '5 Years',
    timeText: { days: '', main: '' },
    to: 'The Home Group',
    from: '',
    msg: 'Keep coming back!',
};

describe('DisplayView', () => {
    test('renders the milestone headline and recipient', () => {
        render(DisplayView, { props: { card } });
        expect(screen.getByRole('heading', { name: '5 Years' })).toBeInTheDocument();
        expect(screen.getByText('For The Home Group')).toBeInTheDocument();
        expect(screen.getByText('“Keep coming back!”')).toBeInTheDocument();
    });

    test('exit button calls onexit', async () => {
        const onexit = vi.fn();
        render(DisplayView, { props: { card, onexit } });
        await fireEvent.click(screen.getByLabelText('Exit display view'));
        expect(onexit).toHaveBeenCalledOnce();
    });

    test('no exit button without an onexit handler', () => {
        render(DisplayView, { props: { card } });
        expect(screen.queryByLabelText('Exit display view')).not.toBeInTheDocument();
    });
});
