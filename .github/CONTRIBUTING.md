# Contributing

## Develop

```sh
npm install
npm run dev      # http://localhost:5173
npm run build    # static site in dist/
npm run preview  # serve the built site
```

The build output in `dist/` is a plain static site — host it anywhere, no backend required.

## Lint & format

```sh
npm run format   # prettier --write .
npm run lint     # prettier --check + eslint + svelte-check
npm run all      # format, then lint, then unit tests, then build
```

Prettier, ESLint (flat config) and `svelte-check` are configured the same way as the
`crumb-widget` repo. Run `npm run all` before pushing.

## Tests

```sh
npm test             # unit + component tests (Vitest, jsdom)
npm run coverage     # the same, with a coverage report
npm run test:e2e     # end-to-end tests (Playwright)
npm run test:e2e:ui  # Playwright in UI mode
```

Layout (mirrors the `crumb-widget` repo):

```
src/tests/
  unit/   # Vitest — pure logic (src/lib) + Svelte component tests (@testing-library/svelte)
  e2e/    # Playwright — real-browser flows across chromium/webkit + mobile, incl. axe a11y
```

First time running e2e locally, install the browsers once: `npx playwright install`.
Both suites run on every push/PR via `.github/workflows/test.yml`.

## How it's built

- **Svelte 5** (runes) + **Vite**, a single-page app with three views selected by the URL:
    - no fragment → **Builder**
    - `#<payload>` → **recipient card**
    - payload with `v:"display"` → **display view**
- **Zero-storage:** the whole card (name, milestone, message, language) is encoded into the
  URL _fragment_ (`#…`), which browsers never send to any host — so nothing is stored or
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
