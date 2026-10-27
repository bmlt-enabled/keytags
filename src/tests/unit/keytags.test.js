import { describe, test, expect } from 'vitest';
import { dateSpan, parseCleanDate, earnedTags, milestoneLabel } from '../../lib/keytags.js';

const d = (iso) => parseCleanDate(iso);
const nums = (tags) => tags.map((t) => t.num);

describe('parseCleanDate', () => {
    test('parses a valid YYYY-MM-DD into a local date', () => {
        const date = parseCleanDate('2024-03-15');
        expect(date.getFullYear()).toBe(2024);
        expect(date.getMonth()).toBe(2); // March = 2
        expect(date.getDate()).toBe(15);
    });

    test.each(['', null, undefined, '2024-3-5', '03/15/2024', 'nonsense'])(
        'rejects invalid input %s',
        (bad) => {
            expect(parseCleanDate(bad)).toBeNull();
        },
    );

    test.each([123, ['2024-03-15'], {}, true])('rejects non-string input %s', (bad) => {
        expect(parseCleanDate(bad)).toBeNull();
    });

    test.each(['2025-02-31', '2025-13-01', '2025-00-10', '2025-04-31'])(
        'rejects the impossible date %s instead of rolling it over',
        (bad) => {
            expect(parseCleanDate(bad)).toBeNull();
        },
    );

    test('accepts a valid leap day', () => {
        expect(parseCleanDate('2024-02-29')).not.toBeNull();
        expect(parseCleanDate('2023-02-29')).toBeNull();
    });
});

describe('dateSpan', () => {
    test('a future or equal clean date yields a zero span', () => {
        expect(dateSpan(d('2024-01-01'), d('2024-01-01')).totalDays).toBe(0);
        expect(dateSpan(d('2024-06-01'), d('2024-01-01')).totalDays).toBe(0);
    });

    test('counts whole calendar days', () => {
        expect(dateSpan(d('2024-01-01'), d('2024-01-02')).totalDays).toBe(1);
        expect(dateSpan(d('2024-01-01'), d('2024-03-31')).totalDays).toBe(90);
    });

    test('computes years/months/days with borrow', () => {
        const r = dateSpan(d('2020-01-15'), d('2024-03-10'));
        // days borrow from January (31): 10 − 15 + 31 = 26
        expect(r).toMatchObject({ years: 4, months: 1, days: 26 });
    });

    test('exact one-year span', () => {
        const r = dateSpan(d('2023-10-26'), d('2024-10-26'));
        expect(r).toMatchObject({ years: 1, months: 0, days: 0, totalDays: 366 });
    });
});

describe('earnedTags — standard thresholds', () => {
    test('welcome tag at 1 day, nothing at 0', () => {
        expect(nums(earnedTags(0, 0))).toEqual([]);
        expect(nums(earnedTags(1, 0))).toEqual(['01']);
    });

    test('30/60/90-day boundaries are inclusive', () => {
        expect(nums(earnedTags(29, 0))).toEqual(['01']);
        expect(nums(earnedTags(30, 1))).toEqual(['01', '02']);
        expect(nums(earnedTags(60, 1))).toEqual(['01', '02', '03']);
        expect(nums(earnedTags(89, 2))).toEqual(['01', '02', '03']);
        expect(nums(earnedTags(90, 2))).toEqual(['01', '02', '03', '04']);
    });

    test('month tags only appear past 90 days', () => {
        // 90 days exactly: no month tags yet (requires totalDays > 90)
        expect(nums(earnedTags(90, 3))).toEqual(['01', '02', '03', '04']);
        // 6 months
        expect(nums(earnedTags(183, 6))).toEqual(['01', '02', '03', '04', '05']);
        // 9 months
        expect(nums(earnedTags(274, 9))).toContain('06');
        // 1 year
        expect(nums(earnedTags(365, 12))).toContain('07');
        // 18 months
        expect(nums(earnedTags(548, 18))).toContain('08');
    });

    test('2-year yearly tag with year number', () => {
        const tags = earnedTags(730, 24);
        const last = tags[tags.length - 1];
        expect(last).toMatchObject({ num: '09', kind: 'yearly', years: 2 });
    });
});

describe('earnedTags — specialty tags', () => {
    test('5 years: plain 09 when special off, 15 when on', () => {
        expect(earnedTags(1826, 60, false).at(-1)).toMatchObject({ num: '09' });
        expect(earnedTags(1826, 60, true).at(-1)).toMatchObject({ num: '15', years: 5 });
    });

    test.each([
        [120, '10'], // 10 years
        [180, '16'], // 15 years
        [300, '12'], // 25 years
        [360, '14'], // 30 years
        [240, '11'], // 20 years → generic decade multiple
    ])('milestone at %i months maps to tag %s when special on', (months, expected) => {
        const tags = earnedTags(months * 31, months, true);
        expect(tags.at(-1).num).toBe(expected);
    });

    test('specialty tags are suppressed when special is off', () => {
        const tags = earnedTags(3652, 120, false);
        expect(nums(tags)).not.toContain('10');
        expect(tags.at(-1).num).toBe('09');
    });
});

describe('milestoneLabel', () => {
    test.each([
        [{ num: '01' }, 'Welcome'],
        [{ num: '04' }, '90 Days'],
        [{ num: '07' }, '1 Year'],
        [{ num: '08' }, '18 Months'],
        [{ num: '09', years: 2 }, '2 Years'],
        [{ num: '15', years: 5 }, '5 Years'],
        [{ num: '09', years: 1 }, '1 Year'],
    ])('labels %o as %s', (tag, label) => {
        expect(milestoneLabel(tag)).toBe(label);
    });
});
