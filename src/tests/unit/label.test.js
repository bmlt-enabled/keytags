import { describe, test, expect } from 'vitest';
import { cleanTimeText, getLang } from '../../lib/label.js';
import { languages } from '../../lib/lang/index.js';

describe('getLang', () => {
    test('returns the requested pack', () => {
        expect(getLang('es')).toBe(languages.es);
    });
    test('falls back to English for an unknown code', () => {
        expect(getLang('xx')).toBe(languages.en);
    });
});

describe('cleanTimeText', () => {
    test('invalid span', () => {
        expect(cleanTimeText({ totalDays: 0, years: 0, months: 0, days: 0 }, 'en')).toEqual({
            days: languages.en.result_invalid,
            main: '',
        });
    });

    test('exactly one day', () => {
        const r = cleanTimeText({ totalDays: 1, years: 0, months: 0, days: 0 }, 'en');
        expect(r.days).toBe(languages.en.result_1_day);
        expect(r.main).toBe('');
    });

    test('under 90 days has a day count but no main blurb', () => {
        const r = cleanTimeText({ totalDays: 45, years: 0, months: 1, days: 15 }, 'en');
        expect(r.days).toContain('45');
        expect(r.main).toBe('');
    });

    test('months blurb past 90 days', () => {
        const r = cleanTimeText({ totalDays: 183, years: 0, months: 6, days: 0 }, 'en');
        expect(r.main).toBe('This is 6 months.');
    });

    test('exact one-year blurb', () => {
        const r = cleanTimeText({ totalDays: 366, years: 1, months: 0, days: 0 }, 'en');
        expect(r.main).toBe('This is 1 year.');
    });

    test('multi-year with months and days', () => {
        const r = cleanTimeText({ totalDays: 1000, years: 2, months: 8, days: 27 }, 'en');
        expect(r.main).toBe('This is 2 years, 8 months and 27 days.');
    });

    test('localizes into Spanish', () => {
        const r = cleanTimeText({ totalDays: 366, years: 1, months: 0, days: 0 }, 'es');
        expect(r.main).toBe(languages.es.result_1_year);
    });
});
