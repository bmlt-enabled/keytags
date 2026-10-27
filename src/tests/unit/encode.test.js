import { describe, test, expect } from 'vitest';
import { encodePayload, decodePayload, buildShareUrl } from '../../lib/encode.js';

describe('encode / decode round-trip', () => {
    test('preserves a full payload, including unicode', () => {
        const payload = {
            m: '07',
            y: 2,
            to: 'Sam R.',
            fr: 'Pat',
            msg: 'One day at a time 🎉 — ¡felicidades!',
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

describe('buildShareUrl', () => {
    test('builds origin + path + fragment', () => {
        const url = buildShareUrl({ m: '07' });
        expect(url).toContain('#');
        const [base, frag] = url.split('#');
        expect(base).toBe(window.location.origin + window.location.pathname);
        expect(decodePayload(frag)).toEqual({ m: '07' });
    });
});
