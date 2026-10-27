// Build a card URL the same way the app encodes one: base64url(JSON) in the
// fragment. Node's 'base64url' matches src/lib/encode.js (url-safe, no padding).
export function encode(payload) {
    return Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
}

export function cardPath(payload) {
    return '/#' + encode(payload);
}

export const SAMPLE_CARD = {
    m: '07',
    to: 'Sam R.',
    fr: 'Pat',
    msg: 'Just for Today',
    l: 'en',
    d: '2025-10-26',
};
