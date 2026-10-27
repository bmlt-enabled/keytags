<script>
    import { untrack } from 'svelte';
    import { toPng } from 'html-to-image';
    import KeytagCard from './KeytagCard.svelte';
    import { buildCard, milestoneOptions, keyForTag, milestoneForDate } from '../lib/card.js';
    import { buildShareUrl } from '../lib/encode.js';

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

    const DEFAULTS = {
        to: '',
        from: '',
        msg: '',
        lang: 'en',
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
    let previewEl = $state(null);

    const options = $derived(milestoneOptions(special));
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

    const today = new Date().toISOString().slice(0, 10);

    // A valid clean date auto-selects the milestone it earns.
    $effect(() => {
        const tag = milestoneForDate(cleanDate, special);
        if (tag) milestoneKey = keyForTag(tag);
    });

    async function copyLink() {
        try {
            await navigator.clipboard.writeText(shareUrl);
            copied = true;
            setTimeout(() => (copied = false), 1800);
        } catch {
            copied = false;
        }
    }

    function openDisplay() {
        window.open(buildShareUrl({ ...payload, v: 'display' }), '_blank', 'noopener');
    }

    async function downloadPng() {
        if (!previewEl) return;
        const bg = getComputedStyle(document.body).backgroundColor || '#ffffff';
        const dataUrl = await toPng(previewEl, {
            pixelRatio: 2,
            backgroundColor: bg,
            cacheBust: true,
        });
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = `keytag-${sel.label.replace(/\s+/g, '-').toLowerCase()}.png`;
        a.click();
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
        onreset?.();
    }
</script>

<div class="builder">
    <section class="form" aria-label="Create a keytag">
        <header class="form-head">
            <h1>Send a <em>Virtual</em> Keytag</h1>
            <p>
                Celebrate someone's clean time. Nothing is stored — the card lives entirely in the
                link you share.
            </p>
            {#if initial}
                <p class="editing">Editing this keytag — change anything and share a new link.</p>
            {/if}
        </header>

        <label class="field">
            <span>Recipient's name or initial</span>
            <input type="text" bind:value={to} maxlength="40" placeholder="e.g. Sam R." />
        </label>

        <label class="field">
            <span>Milestone</span>
            <select bind:value={milestoneKey}>
                {#each options as opt (opt.key)}
                    <option value={opt.key}>{opt.label}</option>
                {/each}
            </select>
            <p class="help">
                The clean-time tag to celebrate. A clean date below can pick it for you.
            </p>
        </label>

        <label class="field">
            <span>Clean date <em>(optional)</em></span>
            <input type="date" bind:value={cleanDate} min="1953-01-01" max={today} />
            <p class="help">
                Adds exact clean time to the card (e.g. “This is 1 year”) and auto-selects the
                matching milestone.
            </p>
        </label>

        <label class="field">
            <span>Personal message <em>(optional)</em></span>
            <textarea bind:value={msg} maxlength="180" rows="2" placeholder="Just for Today"
            ></textarea>
        </label>

        <label class="field">
            <span>From <em>(optional)</em></span>
            <input type="text" bind:value={from} maxlength="40" placeholder="Your name" />
        </label>

        <label class="field">
            <span>Language</span>
            <select bind:value={lang}>
                {#each LANGS as l (l.code)}
                    <option value={l.code}>{l.label}</option>
                {/each}
            </select>
        </label>

        <div class="toggles">
            <label class="check">
                <input type="checkbox" bind:checked={special} />
                <span>Show specialty long-term tags</span>
            </label>
            <p class="help toggle-help">
                Adds commemorative 5-, 10-, 15-, 25- and 30-year tags to the milestone list above.
            </p>

            <label class="check">
                <input type="checkbox" bind:checked={official} />
                <span>Use official NA tag faces</span>
            </label>
            <p class="help toggle-help">
                Puts the official NA logo on the front of the tag. Leave off (the default) for a
                plain face.
            </p>
        </div>

        {#if official}
            <p class="note">
                The official NA name and symbol are NAWS registered trademarks. Only enable this if
                your service body is authorized to use them; otherwise leave it off for generic
                faces.
            </p>
        {/if}

        <div class="actions">
            <button class="btn primary" onclick={copyLink}
                >{copied ? 'Copied!' : 'Copy share link'}</button
            >
            <button class="btn" onclick={downloadPng}>Download image</button>
            <button class="btn" onclick={openDisplay}>Open display view</button>
            <button class="btn ghost" onclick={startOver}>Start over</button>
        </div>
    </section>

    <section class="preview" aria-label="Preview">
        <div class="preview-stage" bind:this={previewEl}>
            <KeytagCard {card} intro={false} />
        </div>
        <p class="hint">Tap the tag to flip it.</p>
    </section>
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

    .preview {
        position: sticky;
        top: 1.5rem;
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
