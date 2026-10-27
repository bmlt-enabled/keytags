# Repository review — prioritized plan (October 26, 2026)

A prioritization of the findings in [repository-review-2026-10-26.md](./repository-review-2026-10-26.md),
ordered by user-facing impact and risk/effort rather than by the numbering in the review.

## Verification notes

The trickiest claims were spot-checked against the code and hold up:

- **#2** — `decodePayload` ([encode.js:46](../src/lib/encode.js)) returns any object _or array_
  with no field validation, and `parseCleanDate` ([keytags.js:54](../src/lib/keytags.js)) is
  reachable with a non-string `d`, so the `.split`/`.trim` crashes are real. The decoder also
  accepts impossible dates because `new Date(y, m-1, d)` silently normalizes (no round-trip check).
- **#3** — `dateSpan` ([keytags.js:36](../src/lib/keytags.js)) borrows using the length of the
  _clean-date's_ month (`fromDate.getMonth() + 1`), not the month actually being borrowed into —
  a genuine calendar bug. **Caveat:** this function is lifted _verbatim from NACC_ (per CLAUDE.md),
  so changing it diverges from upstream. That is a decision, not just a patch.

## Tier 1 — Breaks the core promise (do first)

1. **#1 PNG export is wrong/empty.** ✅ **Done.** `KeytagCard` gained a `flat` mode (single
   face, no `preserve-3d`/`backface-visibility`), and the builder captures a dedicated flat node
   — mounted only during capture, with images decoded first — instead of the interactive 3D
   preview. Verified with a real cross-engine Playwright test that decodes the exported PNG and
   asserts the tag actually rendered (Chromium + WebKit + both mobile profiles), replacing the
   mocked-`toPng` blind spot.
2. **#2 Malformed link → blank page.** ✅ **Done.** `decodePayload` now sanitizes at the decode
   boundary (shape/type/length checks, milestone + view allowlists, unsupported language → `en`,
   nothing-to-render → builder), and `parseCleanDate` rejects non-strings and impossible dates
   (round-trip check). 23 regression tests added, including the two crash repros from the review.

## Tier 2 — Shows wrong or missing information

3. **#7 Newcomers (1–89 days) see only "Welcome," no day count.** ✅ **Done.** `cleanTimeText`
   now returns a resolved `line` (calendar breakdown past 90 days, otherwise the day count,
   empty for an invalid span), and both card views render `line`, so newcomers see their exact
   clean time.
4. **#6 Editing silently bumps the milestone.** ✅ **Done.** A one-shot `skipDateSync` guard
   preserves the encoded milestone on initial edit-load (when the payload has both `m` and `d`);
   later date/special changes still auto-select normally.
5. **#3 Calendar day-count off by a few days.** ✅ **Done (fixed both places).** `dateSpan` now
   borrows the length of the month being borrowed _into_ (the month before `now`, in `now`'s
   year), fixing leap-February and differing-month-length skew; the DST-safe `totalDays` is
   untouched. Fixed in `keytags.js` **and** in the NACC source (`../nacc/nacc2/src/calc.js`) so
   the two stay in sync — no divergence. Replaced the test that encoded the wrong 26-day result.
6. **#4 Clean time beyond 50 years falls back to Welcome.** ✅ **Done.** `milestoneOptions` takes
   a `maxYears` (floored at 50); the builder raises it to cover a date-derived milestone, so a
   50+ year clean date keeps its real milestone instead of resetting to Welcome.

## Tier 3 — Robustness / UX

7. **#5 Back button restores a stale or blank edit form.** ✅ **Done.** The builder is wrapped in
   `{#key hash}` in `App.svelte`, so it remounts and re-seeds whenever the routed fragment
   changes (edit → start over → Back, or switching between edit links). The hash doesn't change
   while typing, so this never remounts mid-edit. Covered by a browser-history e2e.
8. **#8 Long unbroken text overflows mobile layouts.** ✅ **Done.** `overflow-wrap: anywhere` on
   `.kt-text` and `.display-text` (inherited by every caption line) breaks long words/URLs in the
   card, display, preview and exported-image layouts. Covered by a no-horizontal-overflow e2e.
9. **#10 Copy and export failures give no error feedback or recovery path.** ✅ **Done.** Copy
   failures now reveal a selectable manual-copy link; export runs through a `working`/`error`
   state (button shows "Preparing…" and disables, failure shows a retryable message). Status is
   in an `aria-live` region for assistive tech. Both paths have regression tests.

## Tier 4 — Policy decisions and infrastructure (not bugs)

10. **#9 Partial localization.** A _scope decision_ ("does the language control apply to the
    whole UI or only card content?"), not a defect. Resolve the intent before coding.
11. **#11 Test gaps.** Not a standalone phase — fold the specific regressions into each fix above
    (real PNG check with #1, malformed-payload tests with #2, controlled-clock milestone tests
    with #3/#4/#7).
12. **#12 Dev-dependency audit.** Dev-tooling only; advisories need Windows/network preconditions
    and show no exploit against the static bundle. Low urgency — routine maintenance.
13. **#13 Google Fonts.** A privacy _observation_, not a leak (the fragment never leaves the
    browser). Self-hosting fits the project ethos but is the lowest-priority item.

## Changes from the review's suggested order

- **#7 pulled up** — common user group, cheap fix.
- **#3 flagged as decision-gated** by its NACC-verbatim origin.
- **#9 / #11 / #12 / #13 treated as policy/maintenance** rather than ranked bugs.

## Suggested first step

Either start on **#1 (PNG export)**, or land the two cheap high-value guards first —
**#2 (payload validation) + #7 (newcomer day-count)** — as a quick win while the PNG fix
needs cross-engine testing.
