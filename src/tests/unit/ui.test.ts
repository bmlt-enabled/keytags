import { describe, test, expect } from 'vitest';
import {
    uiStrings,
    detectLang,
    milestoneHeadline,
    optionLabel,
    splitEmphasis,
    fillToken,
    SUPPORTED_UI_LANGS,
} from '../../lib/ui';

describe('uiStrings', () => {
    test('returns the requested language', () => {
        expect(uiStrings('es').action_copy).toBe('Copiar enlace');
        expect(uiStrings('it').label_for).toBe('Per');
    });

    test('falls back to English per key for an unknown language', () => {
        const t = uiStrings('xx');
        expect(t.action_copy).toBe('Copy share link');
        expect(t.label_for).toBe('For');
    });

    test('every supported language defines the same keys as English', () => {
        const enKeys = Object.keys(uiStrings('en')).sort();
        for (const lang of SUPPORTED_UI_LANGS) {
            expect(Object.keys(uiStrings(lang)).sort()).toEqual(enKeys);
        }
    });
});

describe('detectLang', () => {
    test.each([
        [['en-US'], 'en'],
        [['es-MX', 'en'], 'es'],
        [['pt-BR'], 'pt'],
        [['it'], 'it'],
        [['fr', 'de'], 'fr'], // now supported
        [['ko', 'tr'], 'en'], // unsupported → English
        [[], 'en'],
    ])('%j → %s', (preferred, expected) => {
        expect(detectLang(preferred)).toBe(expected);
    });

    test('resolves Chinese to the right script', () => {
        expect(detectLang(['zh-Hans'])).toBe('zh-Hans');
        expect(detectLang(['zh-CN'])).toBe('zh-Hans');
        expect(detectLang(['zh-TW'])).toBe('zh-Hant');
        expect(detectLang(['zh-Hant-HK'])).toBe('zh-Hant');
        expect(detectLang(['zh'])).toBe('zh-Hans');
    });

    test('accepts a bare string and skips junk entries', () => {
        expect(detectLang('es')).toBe('es');
        expect(detectLang([null, undefined, '', 'es'])).toBe('es');
    });
});

describe('milestoneHeadline', () => {
    const en = uiStrings('en');
    const es = uiStrings('es');

    test('standard tags map to their localized name', () => {
        expect(milestoneHeadline({ num: '01' }, en)).toBe('24 Hours');
        expect(milestoneHeadline({ num: '07' }, es)).toBe('1 Año');
    });

    test('yearly tags format with the count, singular-safe', () => {
        expect(milestoneHeadline({ num: '09', years: 2 }, en)).toBe('2 Years');
        expect(milestoneHeadline({ num: '09', years: 51 }, es)).toBe('51 Años');
        expect(milestoneHeadline({ num: '09', years: 1 }, en)).toBe('1 Year');
    });

    test('falls back to the clean-time label', () => {
        expect(milestoneHeadline({ num: 'zz' }, en)).toBe('Clean Time');
    });
});

describe('optionLabel', () => {
    const it = uiStrings('it');
    test('standard and yearly options localize', () => {
        expect(optionLabel({ key: 'welcome', label: '24 Hours' }, it)).toBe('24 Ore');
        expect(optionLabel({ key: 'y5', years: 5, label: '5 Years' }, it)).toBe('5 Anni');
    });
});

describe('splitEmphasis', () => {
    test('splits a title on {…} markers', () => {
        expect(splitEmphasis('Send a {Virtual} Keytag')).toEqual([
            { text: 'Send a ', em: false },
            { text: 'Virtual', em: true },
            { text: ' Keytag', em: false },
        ]);
    });
    test('handles a string with no marker', () => {
        expect(splitEmphasis('Plain title')).toEqual([{ text: 'Plain title', em: false }]);
    });
    test('handles a marker at the start', () => {
        expect(splitEmphasis('{虚拟}钥匙扣')).toEqual([
            { text: '虚拟', em: true },
            { text: '钥匙扣', em: false },
        ]);
    });
});

describe('fillToken', () => {
    test('replaces a single token', () => {
        expect(fillToken('{headline} keytag', 'headline', '1 Year')).toBe('1 Year keytag');
    });
});
