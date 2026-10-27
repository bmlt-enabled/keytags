<script>
    import { untrack, flushSync } from 'svelte';
    import { toPng } from 'html-to-image';
    import KeytagCard from './KeytagCard.svelte';
    import { buildCard, milestoneOptions, keyForTag, milestoneForDate } from '../lib/card.js';
    import { buildShareUrl } from '../lib/encode.js';
    import { uiStrings, detectLang, optionLabel, splitEmphasis } from '../lib/ui.js';

    // `initial` seeds the form when editing an existing keytag; `onreset` clears
    // the URL back to a blank builder.
    let { initial = null, onreset } = $props();

    const LANGS = [
        { code: 'en', label: 'English' },
        { code: 'es', label: 'Español' },
        { code: 'pt', label: 'Português' },
        { code: 'it', label: 'Italiano' },
        { code: 'zh-Hans', label: '简体中文' },
        { code: 'zh-Hant', label: '繁體中文' },
    ];

    // Default UI/card language: an edit payload's own language, else the
    // browser's preferred language, else English.
    const defaultLang =
        typeof navigator !== 'undefined'
            ? detectLang(navigator.languages ?? [navigator.language])
            : 'en';

    const DEFAULTS = {
        to: '',
        from: '',
        msg: '',
        lang: defaultLang,
        official: false,
        special: false,
        cleanDate: '',
        milestoneKey: 'welcome',
    };

    // Seed once from `initial` (untrack: capturing the first value is intended —
    // the component is remounted when a different keytag is edited).
    const seed = untrack(() => ({
        to: initial?.to ?? DEFAULTS.to,
        from: initial?.fr ?? DEFAULTS.from,
        msg: initial?.msg ?? DEFAULTS.msg,
        lang: initial?.l ?? DEFAULTS.lang,
        official: initial?.o === 1,
        special: initial?.s === 1,
        cleanDate: initial?.d ?? DEFAULTS.cleanDate,
        milestoneKey: initial?.m
            ? keyForTag({ num: initial.m, years: initial.y })
            : DEFAULTS.milestoneKey,
    }));

    let to = $state(seed.to);
    let from = $state(seed.from);
    let msg = $state(seed.msg);
    let lang = $state(seed.lang);
    let official = $state(seed.official);
    let special = $state(seed.special);
    let cleanDate = $state(seed.cleanDate);
    let milestoneKey = $state(seed.milestoneKey);

    let copied = $state(false);
    let copyError = $state(false);
    let downloadState = $state('idle'); // 'idle' | 'working' | 'error'
    let previewEl = $state(null);
    let exportEl = $state(null);
    let exporting = $state(false);

    // The milestone a valid clean date earns (or null). Drives the auto-select
    // effect below and widens the menu so a 50+ year date is never dropped.
    const dateTag = $derived(milestoneForDate(cleanDate, special));
    const maxYears = $derived(Math.max(50, dateTag?.years ?? 0));
    const options = $derived(milestoneOptions(special, maxYears));
    const sel = $derived(options.find((o) => o.key === milestoneKey) ?? options[0]);

    const payload = $derived({
        m: sel.num,
        y: sel.years ?? undefined,
        to: to.trim() || undefined,
        fr: from.trim() || undefined,
        msg: msg.trim() || undefined,
        l: lang,
        o: official ? 1 : undefined,
        s: special ? 1 : undefined,
        d: cleanDate || undefined,
    });

    const card = $derived(buildCard(payload));
    const shareUrl = $derived(buildShareUrl(payload));

    // Whole-UI strings follow the selected language.
    const t = $derived(uiStrings(lang));
    const titleParts = $derived(splitEmphasis(t.title));

    // Keep <html lang> in sync with the live builder language.
    $effect(() => {
        document.documentElement.lang = lang;
    });

    const today = new Date().toISOString().slice(0, 10);

    // When editing a saved card that has both a milestone and a clean date,
    // keep the encoded milestone on load instead of recomputing it from the
    // date (anniversaries since it was made would otherwise bump it — finding
    // #6). Skips only the first effect run; later date/special changes still
    // auto-select normally.
    let skipDateSync = $state(untrack(() => !!(initial && initial.m && initial.d)));

    // A valid clean date auto-selects the milestone it earns.
    $effect(() => {
        const tag = dateTag;
        if (untrack(() => skipDateSync)) {
            skipDateSync = false;
            return;
        }
        if (tag) milestoneKey = keyForTag(tag);
    });

    async function copyLink() {
        copyError = false;
        try {
            await navigator.clipboard.writeText(shareUrl);
            copied = true;
            setTimeout(() => (copied = false), 1800);
        } catch {
            // Clipboard access can be blocked (permissions, insecure context,
            // older browsers). Reveal the link so it can be copied by hand.
            copied = false;
            copyError = true;
        }
    }

    function openDisplay() {
        window.open(buildShareUrl({ ...payload, v: 'display' }), '_blank', 'noopener');
    }

    async function downloadPng() {
        // Capture a flat, single-face copy rather than the interactive 3D
        // preview: the flip's preserve-3d / backface-visibility serialize
        // unreliably across engines (mirrored text in Chromium, a missing tag
        // in WebKit). Mount it synchronously just for the capture.
        if (downloadState === 'working') return;
        downloadState = 'working';
        exporting = true;
        flushSync();
        try {
            if (!exportEl) throw new Error('export node missing');
            // The freshly mounted node's faces must be decoded before capture,
            // or the PNG comes out blank. They share URLs with the (already
            // loaded) preview, so no cache-busting — that would refetch and race.
            await Promise.all(
                [...exportEl.querySelectorAll('img')].map((img) =>
                    (img.complete && img.naturalWidth > 0) || typeof img.decode !== 'function'
                        ? null
                        : img.decode().catch(() => {}),
                ),
            );
            if (document.fonts?.ready) await document.fonts.ready;
            const bg = getComputedStyle(document.body).backgroundColor || '#ffffff';
            const dataUrl = await toPng(exportEl, {
                pixelRatio: 2,
                backgroundColor: bg,
            });
            const a = document.createElement('a');
            a.href = dataUrl;
            a.download = `keytag-${sel.label.replace(/\s+/g, '-').toLowerCase()}.png`;
            a.click();
            downloadState = 'idle';
        } catch {
            // Export can fail (memory, a face that never decoded). Surface it so
            // the user knows to retry rather than silently getting nothing.
            downloadState = 'error';
        } finally {
            exporting = false;
        }
    }

    function startOver() {
        to = DEFAULTS.to;
        from = DEFAULTS.from;
        msg = DEFAULTS.msg;
        lang = DEFAULTS.lang;
        official = DEFAULTS.official;
        special = DEFAULTS.special;
        cleanDate = DEFAULTS.cleanDate;
        milestoneKey = DEFAULTS.milestoneKey;
        copied = false;
        copyError = false;
        downloadState = 'idle';
        onreset?.();
    }
</script>

<div class="builder">
    <section class="form" aria-label={t.aria_form}>
        <header class="form-head">
            <h1>
                {#each titleParts as part, i (i)}{#if part.em}<em>{part.text}</em
                        >{:else}{part.text}{/if}{/each}
            </h1>
            <p>{t.intro}</p>
            {#if initial}
                <p class="editing">{t.editing_note}</p>
            {/if}
        </header>

        <label class="field">
            <span>{t.field_recipient}</span>
            <input type="text" bind:value={to} maxlength="40" placeholder={t.ph_recipient} />
        </label>

        <label class="field">
            <span>{t.field_milestone}</span>
            <select bind:value={milestoneKey}>
                {#each options as opt (opt.key)}
                    <option value={opt.key}>{optionLabel(opt, t)}</option>
                {/each}
            </select>
            <p class="help">{t.help_milestone}</p>
        </label>

        <label class="field">
            <span>{t.field_cleandate} <em>{t.optional}</em></span>
            <input type="date" bind:value={cleanDate} min="1953-01-01" max={today} />
            <p class="help">{t.help_cleandate}</p>
        </label>

        <label class="field">
            <span>{t.field_message} <em>{t.optional}</em></span>
            <textarea bind:value={msg} maxlength="180" rows="2" placeholder={t.ph_message}
            ></textarea>
        </label>

        <label class="field">
            <span>{t.field_from} <em>{t.optional}</em></span>
            <input type="text" bind:value={from} maxlength="40" placeholder={t.ph_from} />
        </label>

        <label class="field">
            <span>{t.field_language}</span>
            <select bind:value={lang}>
                {#each LANGS as l (l.code)}
                    <option value={l.code}>{l.label}</option>
                {/each}
            </select>
        </label>

        <div class="toggles">
            <label class="check">
                <input type="checkbox" bind:checked={special} />
                <span>{t.toggle_special}</span>
            </label>
            <p class="help toggle-help">{t.help_special}</p>

            <label class="check">
                <input type="checkbox" bind:checked={official} />
                <span>{t.toggle_official}</span>
            </label>
            <p class="help toggle-help">{t.help_official}</p>
        </div>

        {#if official}
            <p class="note">{t.note_trademark}</p>
        {/if}

        <div class="actions">
            <button class="btn primary" onclick={copyLink}
                >{copied ? t.action_copied : t.action_copy}</button
            >
            <button class="btn" onclick={downloadPng} disabled={downloadState === 'working'}>
                {downloadState === 'working' ? t.action_preparing : t.action_download}
            </button>
            <button class="btn" onclick={openDisplay}>{t.action_display}</button>
            <button class="btn ghost" onclick={startOver}>{t.action_startover}</button>
        </div>

        <!-- Feedback for clipboard/export failures, announced to assistive tech. -->
        <div class="status" role="status" aria-live="polite">
            {#if copyError}
                <p class="status-msg">{t.copy_error}</p>
                <!-- svelte-ignore a11y_autofocus -->
                <input
                    class="fallback-link"
                    type="text"
                    readonly
                    value={shareUrl}
                    aria-label={t.fallback_label}
                    onclick={(e) => e.currentTarget.select()}
                    onfocus={(e) => e.currentTarget.select()}
                    autofocus
                />
            {/if}
            {#if downloadState === 'error'}
                <p class="status-msg">{t.download_error}</p>
            {/if}
        </div>
    </section>

    <section class="preview" aria-label={t.aria_preview}>
        <div class="preview-stage" bind:this={previewEl}>
            <KeytagCard {card} intro={false} />
        </div>
        <p class="hint">{t.hint_flip}</p>
    </section>

    <!-- Flat copy captured by the PNG export (see downloadPng), mounted only
         during capture so it never duplicates the preview. It renders a single
         face with no 3D flip so the image is reliable in both Chromium and
         WebKit. The wrapper hides it with a zero-size overflow box rather than
         an off-screen offset (which html-to-image renders as a blank frame);
         the captured node itself stays at its natural origin and size. -->
    {#if exporting}
        <div class="export-hidden" aria-hidden="true">
            <div class="preview-stage export-capture" bind:this={exportEl}>
                <KeytagCard {card} intro={false} interactive={false} flat width="260px" />
            </div>
        </div>
    {/if}
</div>

<style>
    .builder {
        max-width: 1060px;
        margin: 0 auto;
        padding: clamp(2rem, 6vw, 4rem) 1rem 5rem;
        display: grid;
        grid-template-columns: 1fr;
        gap: 2.5rem;
    }

    @media (min-width: 840px) {
        .builder {
            grid-template-columns: 1.08fr 0.92fr;
            gap: 3rem;
            align-items: start;
        }
    }

    .form-head {
        margin-bottom: 2rem;
    }

    .form-head h1 {
        font-size: clamp(2.2rem, 6vw, 3.1rem);
        font-weight: 600;
        letter-spacing: -0.02em;
    }

    .form-head h1 em {
        font-style: italic;
        color: var(--accent);
    }

    .form-head p {
        color: var(--muted);
        max-width: 34ch;
        margin: 0.75rem 0 0;
        font-size: 1.02rem;
    }

    .field {
        display: block;
        margin-bottom: 1.3rem;
    }

    .field > span {
        display: block;
        font-size: 0.72rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        color: var(--ink);
        margin-bottom: 0.45rem;
    }

    .field em {
        font-weight: 500;
        color: var(--muted);
        font-style: normal;
        letter-spacing: 0.02em;
        text-transform: none;
    }

    .help {
        margin: 0.4rem 0 0;
        font-size: 0.82rem;
        color: var(--muted);
        line-height: 1.45;
    }

    .toggle-help {
        margin: 0.15rem 0 0.9rem 1.7rem;
    }

    .editing {
        margin: 1rem 0 0;
        display: inline-block;
        font-size: 0.8rem;
        font-weight: 600;
        letter-spacing: 0.02em;
        color: var(--accent);
        background: color-mix(in srgb, var(--accent) 12%, transparent);
        border: 1px solid color-mix(in srgb, var(--accent) 35%, transparent);
        border-radius: 999px;
        padding: 0.3rem 0.8rem;
    }

    input[type='text'],
    input[type='date'],
    select,
    textarea {
        width: 100%;
        padding: 0.75rem 0.85rem;
        border: 1px solid var(--line);
        border-radius: var(--radius);
        background: var(--surface);
        color: var(--ink);
        font: inherit;
        box-shadow: var(--shadow-soft);
        transition:
            border-color 0.15s ease,
            box-shadow 0.15s ease;
    }

    input:focus,
    select:focus,
    textarea:focus {
        outline: none;
        border-color: var(--accent);
        box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 25%, transparent);
    }

    .toggles {
        display: flex;
        flex-direction: column;
        gap: 0.4rem;
        margin: 1.25rem 0;
    }

    .check {
        display: flex;
        align-items: center;
        gap: 0.6rem;
        font-weight: 600;
        font-size: 0.95rem;
    }

    .check input {
        width: 1.1rem;
        height: 1.1rem;
        accent-color: var(--accent);
    }

    .note {
        font-size: 0.85rem;
        color: var(--muted);
        background: color-mix(in srgb, var(--accent) 7%, var(--surface));
        border: 1px solid color-mix(in srgb, var(--accent) 22%, var(--line));
        border-radius: var(--radius);
        padding: 0.75rem 0.9rem;
        margin: 0 0 1.25rem;
    }

    .actions {
        display: flex;
        flex-wrap: wrap;
        gap: 0.6rem;
        margin-top: 1.75rem;
    }

    .btn {
        padding: 0.72rem 1.2rem;
        border-radius: var(--radius);
        border: 1px solid var(--line);
        background: var(--surface);
        color: var(--ink);
        font-weight: 600;
        box-shadow: var(--shadow-soft);
        transition:
            transform 0.15s ease,
            box-shadow 0.15s ease,
            filter 0.15s ease;
    }

    .btn.primary {
        background: var(--accent);
        color: var(--accent-ink);
        border-color: var(--accent);
    }

    .btn.ghost {
        background: none;
        border-color: transparent;
        box-shadow: none;
        color: var(--muted);
    }

    .btn:hover {
        transform: translateY(-1px);
        filter: brightness(1.04);
    }

    .btn:active {
        transform: translateY(0);
    }

    .btn:disabled {
        cursor: default;
        opacity: 0.6;
        transform: none;
        filter: none;
    }

    .status {
        margin-top: 0.9rem;
    }

    .status:empty {
        margin-top: 0;
    }

    .status-msg {
        margin: 0 0 0.5rem;
        font-size: 0.85rem;
        font-weight: 600;
        color: var(--accent);
    }

    .fallback-link {
        width: 100%;
        font-size: 0.85rem;
    }

    .preview {
        position: sticky;
        top: 1.5rem;
    }

    /* Hide the export copy without moving it off-screen: html-to-image renders
       a large negative offset as a blank frame, so clip it with a zero-size box
       instead while the captured node keeps its natural position and size. */
    .export-hidden {
        position: absolute;
        top: 0;
        left: 0;
        width: 0;
        height: 0;
        overflow: hidden;
        pointer-events: none;
    }

    .export-capture {
        width: 340px;
    }

    .preview-stage {
        position: relative;
        background:
            radial-gradient(
                120% 90% at 50% 0%,
                color-mix(in srgb, var(--accent) 6%, transparent),
                transparent 55%
            ),
            var(--surface);
        border: 1px solid var(--line);
        border-radius: calc(var(--radius) + 6px);
        box-shadow: var(--shadow);
        padding: 2.5rem 1.5rem 2rem;
        display: flex;
        justify-content: center;
    }

    /* Inner mat line, for a framed-keepsake feel. */
    .preview-stage::after {
        content: '';
        position: absolute;
        inset: 10px;
        border: 1px solid color-mix(in srgb, var(--line) 70%, transparent);
        border-radius: var(--radius);
        pointer-events: none;
    }

    .hint {
        text-align: center;
        color: var(--muted);
        font-size: 0.8rem;
        letter-spacing: 0.04em;
        margin: 1rem 0 0;
    }

    /* Staggered page-load reveal. */
    @media (prefers-reduced-motion: no-preference) {
        .form > *,
        .preview {
            animation: rise 0.6s cubic-bezier(0.2, 0.7, 0.2, 1) both;
        }
        .form > :nth-child(1) {
            animation-delay: 0.02s;
        }
        .form > :nth-child(2) {
            animation-delay: 0.06s;
        }
        .form > :nth-child(3) {
            animation-delay: 0.1s;
        }
        .form > :nth-child(4) {
            animation-delay: 0.14s;
        }
        .form > :nth-child(5) {
            animation-delay: 0.18s;
        }
        .form > :nth-child(n + 6) {
            animation-delay: 0.22s;
        }
        .preview {
            animation-delay: 0.2s;
        }
    }

    @keyframes rise {
        from {
            opacity: 0;
            transform: translateY(12px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
</style>
