import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import {
    yearlyTag,
    milestoneOptions,
    keyForTag,
    milestoneForDate,
    buildCard,
    tagFront,
    tagBack,
    ringTopSrc,
} from '../../lib/card.js';

describe('yearlyTag', () => {
    test.each([
        [2, false, '09'],
        [5, false, '09'],
        [5, true, '15'],
        [10, true, '10'],
        [15, true, '16'],
        [20, true, '11'],
        [25, true, '12'],
        [30, true, '14'],
    ])('%i years (special=%s) → %s', (years, special, expected) => {
        expect(yearlyTag(years, special)).toBe(expected);
    });
});

describe('milestoneOptions', () => {
    test('starts with the 8 standard milestones then yearly up to 50', () => {
        const opts = milestoneOptions(false);
        expect(opts.slice(0, 8).map((o) => o.key)).toEqual([
            'welcome',
            '30d',
            '60d',
            '90d',
            '6m',
            '9m',
            '1y',
            '18m',
        ]);
        expect(opts.at(-1)).toMatchObject({ key: 'y50', years: 50 });
    });

    test('special flag changes the resolved tag number for the 5-year option', () => {
        const off = milestoneOptions(false).find((o) => o.key === 'y5');
        const on = milestoneOptions(true).find((o) => o.key === 'y5');
        expect(off.num).toBe('09');
        expect(on.num).toBe('15');
    });

    test('maxYears extends the yearly options beyond 50 (finding #4)', () => {
        expect(milestoneOptions(false, 53).at(-1)).toMatchObject({ key: 'y53', years: 53 });
        // Never shrinks below the standard 50-year menu.
        expect(milestoneOptions(false, 10).at(-1)).toMatchObject({ key: 'y50', years: 50 });
    });
});

describe('keyForTag', () => {
    test('standard tag → its key', () => {
        expect(keyForTag({ num: '07' })).toBe('1y');
        expect(keyForTag({ num: '01' })).toBe('welcome');
    });
    test('yearly tag → year key', () => {
        expect(keyForTag({ num: '09', years: 5 })).toBe('y5');
    });
    test('unknown tag falls back to welcome', () => {
        expect(keyForTag({ num: 'zz' })).toBe('welcome');
    });
});

describe('milestoneForDate', () => {
    beforeEach(() => vi.useFakeTimers().setSystemTime(new Date(2026, 9, 26)));
    afterEach(() => vi.useRealTimers());

    test('returns the highest tag earned as of a date', () => {
        expect(milestoneForDate('2025-10-26', false)).toMatchObject({ num: '07' }); // 1 year
        expect(milestoneForDate('2024-10-26', false)).toMatchObject({ num: '09', years: 2 });
    });
    test('null for an invalid date', () => {
        expect(milestoneForDate('', false)).toBeNull();
    });
});

describe('buildCard', () => {
    beforeEach(() => vi.useFakeTimers().setSystemTime(new Date(2026, 9, 26)));
    afterEach(() => vi.useRealTimers());

    test('maps a full payload to a view-model', () => {
        const card = buildCard({
            m: '07',
            to: 'Sam R.',
            fr: 'Pat',
            msg: 'Proud of you.',
            l: 'en',
            d: '2025-10-26',
        });
        expect(card).toMatchObject({
            headline: '1 Year',
            to: 'Sam R.',
            from: 'Pat',
            msg: 'Proud of you.',
            lang: 'en',
            official: false,
        });
        expect(card.timeText.main).toBe('This is 1 year.');
    });

    test('defaults: welcome tag, generic faces, empty text, no clean-time line', () => {
        const card = buildCard({});
        expect(card.tag).toMatchObject({ num: '01' });
        expect(card.official).toBe(false);
        expect(card.timeText.main).toBe('');
    });

    test('a newcomer (under 90 days) still gets an exact clean-time line', () => {
        // Clock is 2026-10-26; 12 days of clean time. The milestone face is
        // still "Welcome", but the card must show the day count (finding #7).
        const card = buildCard({ m: '01', d: '2026-10-14' });
        expect(card.headline).toBe('Welcome');
        expect(card.timeText.main).toBe('');
        expect(card.timeText.line).toBe('You have been clean for 12 days!');
    });

    test('honors official and special flags', () => {
        const card = buildCard({ m: '15', y: 5, o: 1, s: 1 });
        expect(card.official).toBe(true);
        expect(card.showSpecial).toBe(true);
        expect(card.headline).toBe('5 Years');
    });
});

describe('image path helpers', () => {
    test('generic faces use the back image for the front', () => {
        expect(tagFront('en', '07', false)).toMatch(/images\/en\/07\.png$/);
        expect(tagFront('en', '07', true)).toMatch(/images\/en\/07_Front\.png$/);
        expect(tagBack('es', '09')).toMatch(/images\/es\/09\.png$/);
        expect(ringTopSrc).toMatch(/images\/00_RingTop\.png$/);
    });
});
