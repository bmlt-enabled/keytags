# Virtual Keytags

Send someone a virtual NA clean-time keytag — a little keepsake card celebrating a
milestone — or put one full-screen on a shared screen during an online meeting.

**Zero-storage.** There is no server, database, or account. The entire card (name,
milestone, message, language) is encoded into the URL *fragment* (`#…`), which browsers
never send to any host. Nothing about a card is stored or logged anywhere — it exists
only in the link you share. This keeps the service in line with NA's tradition of
anonymity.

## Features

- **Send a keytag** — pick a milestone (or enter a clean date and the right tag is chosen
  automatically), add a recipient name, a personal message, and your name. Share it as a
  link or download it as an image.
- **Flip card** — the tag hangs from the ring and flips front ↔ back to reveal the
  reading. Degrades to click-to-flip when the viewer prefers reduced motion.
- **Display view** — a full-screen version for sharing on a Zoom/online-meeting screen
  during clean-time celebrations.
- **6 languages** — English, Spanish, Portuguese, Italian, 简体中文, 繁體中文 (localized tag
  images and clean-time wording).
- **Specialty long-term tags** — optional 5/10/15/25/30-year and other specialty tags.

## Assets & logic reused from NACC

This project reuses the keytag assets and clean-time logic from the sibling
[NACC](../nacc) (NA Cleantime Calculator) project:

- `public/images/**` — the localized keytag PNG set + ring overlay (copied from
  `nacc/nacc2/images/`).
- `src/lib/keytags.js` — `dateSpan()` (DST-safe day math) and `earnedTags()`, a pure
  extraction of NACC's `createTagsArray` milestone thresholds.
- `src/lib/label.js` + `src/lib/lang/` — the localized clean-time sentence.

## ⚠️ Trademark note

The official NA name and stylized symbol on the `*_Front.png` tag faces are NAWS
registered trademarks. The service defaults to **generic faces**. Only enable "Use
official NA tag faces" if your service body is authorized to use the marks.

## Develop

```sh
npm install
npm run dev      # http://localhost:5173
npm run build    # static site in dist/
npm run preview  # serve the built site
```

The build output in `dist/` is a plain static site — host it anywhere, no backend
required.

## How it's built

- **Svelte 5** (runes) + **Vite**, a single-page app with three views selected by the URL:
  - no fragment → **Builder**
  - `#<payload>` → **recipient card**
  - payload with `v:"display"` → **display view**
- `src/lib/encode.js` — base64url(JSON) codec for the URL-fragment payload.
- `src/components/` — `Builder.svelte`, `KeytagCard.svelte`, `DisplayView.svelte`.
- Image download is rendered client-side with `html-to-image` (no upload).
