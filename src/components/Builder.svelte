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
            <h1>Send a Virtual Keytag</h1>
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
        max-width: 1040px;
        margin: 0 auto;
        padding: 2rem 1rem 4rem;
        display: grid;
        grid-template-columns: 1fr;
        gap: 2rem;
    }

    @media (min-width: 820px) {
        .builder {
            grid-template-columns: 1.1fr 0.9fr;
            align-items: start;
        }
    }

    .form-head h1 {
        font-size: clamp(1.8rem, 5vw, 2.4rem);
        font-weight: 800;
        letter-spacing: -0.02em;
    }

    .form-head p {
        color: var(--muted);
        margin: 0.5rem 0 1.5rem;
    }

    .field {
        display: block;
        margin-bottom: 1.1rem;
    }

    .field > span {
        display: block;
        font-size: 0.9rem;
        font-weight: 600;
        margin-bottom: 0.35rem;
    }

    .field em {
        font-weight: 400;
        color: var(--muted);
        font-style: normal;
    }

    .help {
        margin: 0.35rem 0 0;
        font-size: 0.8rem;
        color: var(--muted);
        line-height: 1.4;
    }

    .toggle-help {
        margin: 0.1rem 0 0.75rem 1.55rem;
    }

    .editing {
        margin: -0.75rem 0 1.5rem;
        font-size: 0.85rem;
        font-weight: 600;
        color: var(--link);
    }

    input[type='text'],
    input[type='date'],
    select,
    textarea {
        width: 100%;
        padding: 0.65rem 0.75rem;
        border: 1px solid var(--line);
        border-radius: 10px;
        background: var(--surface);
        color: var(--ink);
        font: inherit;
    }

    input:focus,
    select:focus,
    textarea:focus {
        outline: 2px solid var(--accent);
        outline-offset: 1px;
    }

    .toggles {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        margin: 1rem 0;
    }

    .check {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.95rem;
    }

    .check input {
        width: 1.05rem;
        height: 1.05rem;
    }

    .note {
        font-size: 0.85rem;
        color: var(--muted);
        background: var(--surface);
        border: 1px solid var(--line);
        border-radius: 10px;
        padding: 0.65rem 0.8rem;
        margin: 0 0 1rem;
    }

    .actions {
        display: flex;
        flex-wrap: wrap;
        gap: 0.6rem;
    }

    .btn {
        padding: 0.7rem 1.1rem;
        border-radius: 10px;
        border: 1px solid var(--line);
        background: var(--surface);
        color: var(--ink);
        font-weight: 600;
    }

    .btn.primary {
        background: var(--accent);
        color: var(--accent-ink);
        border-color: var(--accent);
    }

    .btn.ghost {
        background: none;
        border-color: transparent;
        color: var(--muted);
    }

    .btn:hover {
        filter: brightness(1.05);
    }

    .preview {
        position: sticky;
        top: 1.5rem;
    }

    .preview-stage {
        background: var(--surface);
        border: 1px solid var(--line);
        border-radius: var(--radius);
        box-shadow: var(--shadow);
        padding: 2rem 1.5rem;
        display: flex;
        justify-content: center;
    }

    .hint {
        text-align: center;
        color: var(--muted);
        font-size: 0.85rem;
        margin: 0.75rem 0 0;
    }
</style>
