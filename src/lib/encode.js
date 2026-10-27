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

function toBase64Url(str) {
    const bytes = new TextEncoder().encode(str);
    let binary = '';
    bytes.forEach((b) => (binary += String.fromCharCode(b)));
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(b64url) {
    const b64 = b64url.replace(/-/g, '+').replace(/_/g, '/');
    const binary = atob(b64);
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
    return new TextDecoder().decode(bytes);
}

/** @param {object} payload @returns {string} the encoded fragment (no leading #) */
export function encodePayload(payload) {
    return toBase64Url(JSON.stringify(payload));
}

/** @param {string} fragment (with or without leading #) @returns {object|null} */
export function decodePayload(fragment) {
    if (!fragment) return null;
    const raw = fragment.startsWith('#') ? fragment.slice(1) : fragment;
    if (!raw) return null;
    try {
        const obj = JSON.parse(fromBase64Url(raw));
        return obj && typeof obj === 'object' ? obj : null;
    } catch {
        return null;
    }
}

/** Build a full shareable URL for the current origin + path. */
export function buildShareUrl(payload) {
    const base = window.location.origin + window.location.pathname;
    return `${base}#${encodePayload(payload)}`;
}
