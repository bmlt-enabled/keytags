# Contributing

## Develop

```sh
npm install
npm run dev      # http://localhost:5173
npm run build    # static site in dist/
npm run preview  # serve the built site
```

The build output in `dist/` is a plain static site — host it anywhere, no backend required.

## How it's built

- **Svelte 5** (runes) + **Vite**, a single-page app with three views selected by the URL:
  - no fragment → **Builder**
  - `#<payload>` → **recipient card**
  - payload with `v:"display"` → **display view**
- **Zero-storage:** the whole card (name, milestone, message, language) is encoded into the
  URL *fragment* (`#…`), which browsers never send to any host — so nothing is stored or
  logged. `src/lib/encode.js` is the base64url(JSON) codec.
- Client-side hash routing means `index.html` serves every route — no SPA fallback needed.
- `src/components/` — `Builder.svelte`, `KeytagCard.svelte`, `DisplayView.svelte`.
- Image download is rendered client-side with `html-to-image` (no upload).

## Reused from NACC

Keytag assets and clean-time logic come from the sibling [NACC](../nacc) (NA Cleantime
Calculator) project:

- `public/images/**` — the localized keytag PNG set + ring overlay (from `nacc/nacc2/images/`).
- `src/lib/keytags.js` — `dateSpan()` (DST-safe day math) and `earnedTags()`, a pure
  extraction of NACC's `createTagsArray` milestone thresholds.
- `src/lib/label.js` + `src/lib/lang/` — the localized clean-time sentence.

## Deploy

Hosted on Cloudflare Pages via the [`cloudflare-pages`](../cloudflare-pages) Terraform repo
(`npm run build` → `dist/`, served at keytags.bmlt.app). Pushes to `main` auto-deploy; see
that repo's `AGENTS.md` for the Terraform entry.
