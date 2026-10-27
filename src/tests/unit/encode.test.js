import { describe, test, expect } from 'vitest';
import { encodePayload, decodePayload, buildShareUrl } from '../../lib/encode.js';

describe('encode / decode round-trip', () => {
    test('preserves a full payload, including unicode', () => {
        const payload = {
            m: '07',
            y: 2,
            to: 'Sam R.',
            fr: 'Pat',
            msg: 'Just for Today 🎉 — ¡felicidades!',
            l: 'es',
            o: 1,
        };
        expect(decodePayload('#' + encodePayload(payload))).toEqual(payload);
    });

    test('accepts a fragment with or without the leading #', () => {
        const enc = encodePayload({ m: '01' });
        expect(decodePayload(enc)).toEqual({ m: '01' });
        expect(decodePayload('#' + enc)).toEqual({ m: '01' });
    });

    test('produces URL-safe output (no +, /, or = padding)', () => {
        const enc = encodePayload({ msg: '???>>>///+++ lots of padding chars' });
        expect(enc).not.toMatch(/[+/=]/);
    });
});

describe('decodePayload — bad input', () => {
    test.each(['', null, undefined, '#', '#not*valid*base64!!', '#' + btoa('not json')])(
        'returns null for %s',
        (bad) => {
            expect(decodePayload(bad)).toBeNull();
        },
    );
});

describe('decodePayload — malformed-but-valid-JSON payloads', () => {
    const frag = (obj) => '#' + encodePayload(obj);

    test.each([
        ['an array', ['2025-01-01']],
        ['a bare string', 'hello'],
        ['a number', 42],
        ['a null payload', null],
    ])('rejects %s', (_label, value) => {
        expect(decodePayload(frag(value))).toBeNull();
    });

    // Regressions for the two crashes reported in the repository review:
    // a non-string clean date, and a non-string recipient name.
    test('rejects a non-string clean date rather than crashing', () => {
        expect(decodePayload(frag({ m: '07', d: ['2025-01-01'] }))).toBeNull();
    });

    test('rejects a non-string recipient name rather than crashing', () => {
        expect(decodePayload(frag({ m: '07', to: 123, v: 'edit' }))).toBeNull();
    });

    test('rejects an unknown milestone tag number', () => {
        expect(decodePayload(frag({ m: '99' }))).toBeNull();
        expect(decodePayload(frag({ m: 7 }))).toBeNull();
    });

    test('rejects an impossible clean date', () => {
        expect(decodePayload(frag({ d: '2025-02-31' }))).toBeNull();
    });

    test('rejects over-length free text', () => {
        expect(decodePayload(frag({ m: '07', msg: 'A'.repeat(181) }))).toBeNull();
        expect(decodePayload(frag({ m: '07', to: 'A'.repeat(41) }))).toBeNull();
    });

    test('rejects a payload with neither a milestone nor a clean date', () => {
        expect(decodePayload(frag({ to: 'Sam R.' }))).toBeNull();
    });

    test('normalizes an unsupported language to English', () => {
        expect(decodePayload(frag({ m: '07', l: 'xx' }))).toEqual({ m: '07', l: 'en' });
    });

    test('drops an unknown view flag to the default card view', () => {
        expect(decodePayload(frag({ m: '07', v: 'bogus' }))).toEqual({ m: '07' });
    });

    test('keeps a valid payload intact', () => {
        const ok = { m: '09', y: 2, to: 'Sam R.', fr: 'Pat', msg: 'Just for Today', l: 'es', o: 1 };
        expect(decodePayload(frag(ok))).toEqual(ok);
    });

    test('accepts a clean-date-only payload', () => {
        expect(decodePayload(frag({ d: '2024-10-26' }))).toEqual({ d: '2024-10-26' });
    });
});

describe('buildShareUrl', () => {
    test('builds origin + path + fragment', () => {
        const url = buildShareUrl({ m: '07' });
        expect(url).toContain('#');
        const [base, frag] = url.split('#');
        expect(base).toBe(window.location.origin + window.location.pathname);
        expect(decodePayload(frag)).toEqual({ m: '07' });
    });
});
