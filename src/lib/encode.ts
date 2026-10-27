/**
 * Zero-storage payload codec.
 *
 * The entire card lives in the URL *fragment* (the part after `#`), which
 * browsers never send to the server — so no host, log, or CDN ever sees the
 * card data. We store it as base64url(JSON), unicode-safe.
 *
 * Compact payload keys:
 *   d   clean date (YYYY-MM-DD)   — optional if `m` is given
 *   m   explicit milestone tag num (e.g. "07") — overrides date-derived tag
 *   to  recipient name / initial
 *   fr  sender name (optional)
 *   msg personal message (optional)
 *   l   language code (default "en")
 *   o   official (trademarked) faces: 1 = on, else generic
 *   s   show specialty tags: 1 = on
 *   v   view: "display" for full-screen meeting mode, else card
 */

import { parseCleanDate } from './keytags';
import { languages } from './lang/index';
import type { Payload } from './types';

// Allowlists for validating untrusted payloads from shared links.
const TAG_NUMS = new Set<string>([
    '01',
    '02',
    '03',
    '04',
    '05',
    '06',
    '07',
    '08',
    '09',
    '10',
    '11',
    '12',
    '13',
    '14',
    '15',
    '16',
]);
const SUPPORTED_LANGS = new Set<string>(Object.keys(languages));
const VIEWS = new Set<string>(['display']);
// Length caps match the builder's input `maxlength` attributes.
const STR_MAX: Record<'to' | 'fr' | 'msg', number> = { to: 40, fr: 40, msg: 180 };

function isPlainObject(v: unknown): v is Record<string, unknown> {
    return typeof v === 'object' && v !== null && !Array.isArray(v);
}

/**
 * Validate and normalize an untrusted decoded payload.
 *
 * Returns a clean payload object, or `null` when the data is structurally
 * unusable so callers fall back to the builder (the project's standard
 * corrupt-fragment behavior). Harmless unknowns are normalized rather than
 * rejected: an unsupported language becomes English, and an unknown view flag
 * is dropped to the default card view.
 */
function sanitizePayload(obj: unknown): Payload | null {
    if (!isPlainObject(obj)) return null;

    const out: Payload = {};

    // Milestone tag number: a known two-digit tag.
    if (obj.m !== undefined) {
        if (typeof obj.m !== 'string' || !TAG_NUMS.has(obj.m)) return null;
        out.m = obj.m;
    }

    // Whole-year count for yearly tags.
    if (obj.y !== undefined) {
        if (typeof obj.y !== 'number' || !Number.isInteger(obj.y) || obj.y < 1 || obj.y > 200) {
            return null;
        }
        out.y = obj.y;
    }

    // Clean date: a real YYYY-MM-DD within sane year bounds.
    if (obj.d !== undefined) {
        if (typeof obj.d !== 'string') return null;
        const date = parseCleanDate(obj.d);
        if (!date) return null;
        const year = date.getFullYear();
        if (year < 1900 || year > 2200) return null;
        out.d = obj.d;
    }

    // Free-text fields: strings within the builder's length limits.
    for (const key of ['to', 'fr', 'msg'] as const) {
        const val = obj[key];
        if (val !== undefined) {
            if (typeof val !== 'string' || val.length > STR_MAX[key]) return null;
            out[key] = val;
        }
    }

    // Language: normalize anything unsupported to English.
    if (obj.l !== undefined) {
        out.l = typeof obj.l === 'string' && SUPPORTED_LANGS.has(obj.l) ? obj.l : 'en';
    }

    // Flags: accept the encoder's `1`/`true`; anything else is off.
    if (obj.o === 1 || obj.o === true) out.o = 1;
    if (obj.s === 1 || obj.s === true) out.s = 1;

    // View: keep only known views; ignore anything else (defaults to card view).
    if (typeof obj.v === 'string' && VIEWS.has(obj.v)) out.v = obj.v;

    // Nothing to render a tag from.
    if (out.m === undefined && out.d === undefined) return null;

    return out;
}

function toBase64Url(str: string): string {
    const bytes = new TextEncoder().encode(str);
    let binary = '';
    bytes.forEach((b) => (binary += String.fromCharCode(b)));
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(b64url: string): string {
    const b64 = b64url.replace(/-/g, '+').replace(/_/g, '/');
    const binary = atob(b64);
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
    return new TextDecoder().decode(bytes);
}

/** @returns the encoded fragment (no leading #) */
export function encodePayload(payload: Payload): string {
    return toBase64Url(JSON.stringify(payload));
}

/** Decode (and validate) a fragment, with or without the leading #. */
export function decodePayload(fragment: string | null | undefined): Payload | null {
    if (!fragment) return null;
    const raw = fragment.startsWith('#') ? fragment.slice(1) : fragment;
    if (!raw) return null;
    try {
        return sanitizePayload(JSON.parse(fromBase64Url(raw)));
    } catch {
        return null;
    }
}

/** Build a full shareable URL for the current origin + path. */
export function buildShareUrl(payload: Payload): string {
    const base = window.location.origin + window.location.pathname;
    return `${base}#${encodePayload(payload)}`;
}
