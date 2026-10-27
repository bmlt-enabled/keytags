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

3. **#7 Newcomers (1–89 days) see only "Welcome," no day count.** Ranked _above_ #3: it hits a
   whole common, emotionally-important user group (newcomers), and the fix is a presentation
   change (the day sentence is already computed).
4. **#6 Editing silently bumps the milestone.** Anyone editing an older card is affected;
   preserve the encoded milestone on edit-load.
5. **#3 Calendar day-count off by a few days.** Real, but an edge case (borrow across months of
   differing length) and it touches verbatim-NACC code — decide the anniversary semantics first.
6. **#4 Clean time beyond 50 years falls back to Welcome.** Same milestone-selection family as
   #3; rare but very wrong when it happens.

## Tier 3 — Robustness / UX

7. **#5** Back button restores a stale or blank edit form.
8. **#8** Long unbroken text overflows mobile layouts.
9. **#10** Copy and export failures give no error feedback or recovery path.

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
