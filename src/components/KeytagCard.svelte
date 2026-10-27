<script>
    import { tagFront, tagBack, ringTopSrc } from '../lib/card.js';

    /**
     * @typedef {Object} Props
     * @property {object} card - view-model from buildCard()
     * @property {boolean} [interactive] - allow click-to-flip
     * @property {boolean} [showText] - render headline/name/message
     * @property {boolean} [intro] - play a one-time reveal flip on mount
     * @property {string} [width] - CSS width for the tag stage
     * @property {boolean} [flat] - render a single flat front face (no 3D flip);
     *   used for PNG export, where `preserve-3d` / `backface-visibility` serialize
     *   unreliably (mirrored text in Chromium, a missing tag in WebKit).
     */

    /** @type {Props} */
    let {
        card,
        interactive = true,
        showText = true,
        intro = true,
        width = 'min(260px, 72vw)',
        flat = false,
    } = $props();

    let flipped = $state(false);

    const reducedMotion =
        typeof window !== 'undefined' &&
        typeof window.matchMedia === 'function' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function toggle() {
        if (interactive) flipped = !flipped;
    }

    function onKey(event) {
        if (interactive && (event.key === 'Enter' || event.key === ' ')) {
            event.preventDefault();
            toggle();
        }
    }

    // One-time reveal: flip to the reading and back, unless reduced motion.
    $effect(() => {
        if (!intro || reducedMotion) return;
        const toBack = setTimeout(() => (flipped = true), 1100);
        const toFront = setTimeout(() => (flipped = false), 3600);
        return () => {
            clearTimeout(toBack);
            clearTimeout(toFront);
        };
    });
</script>

<figure class="kt" class:static={reducedMotion} class:flat>
    <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
    <div
        class="kt-stage"
        style="width: {width}"
        class:flipped
        class:interactive
        role={interactive ? 'button' : 'img'}
        tabindex={interactive ? 0 : undefined}
        aria-label={interactive ? `${card.headline} keytag — activate to flip` : card.headline}
        onclick={toggle}
        onkeydown={onKey}
    >
        <img class="kt-ring" src={ringTopSrc} alt="" aria-hidden="true" />
        <div class="kt-flip">
            <img
                class="kt-face kt-front"
                src={tagFront(card.lang, card.tag.num, card.official)}
                alt={card.headline}
            />
            {#if !flat}
                <img class="kt-face kt-back" src={tagBack(card.lang, card.tag.num)} alt="" />
            {/if}
        </div>
    </div>

    {#if showText}
        <figcaption class="kt-text">
            {#if card.to}
                <p class="kt-to">For {card.to}</p>
            {/if}
            <h2 class="kt-headline">{card.headline}</h2>
            {#if card.timeText.line}
                <p class="kt-span">{card.timeText.line}</p>
            {/if}
            {#if card.msg}
                <p class="kt-msg">“{card.msg}”</p>
            {/if}
            {#if card.from}
                <p class="kt-from">— {card.from}</p>
            {/if}
        </figcaption>
    {/if}
</figure>

<style>
    .kt {
        margin: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
    }

    .kt-stage {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        perspective: 1200px;
        background: none;
        border: none;
        padding: 0;
    }

    .kt-stage.interactive {
        cursor: pointer;
    }

    .kt-ring {
        width: 34%;
        display: block;
        margin-bottom: -8%;
        position: relative;
        z-index: 2;
        pointer-events: none;
        filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.25));
    }

    .kt-flip {
        position: relative;
        width: 100%;
        transform-style: preserve-3d;
        transition: transform 0.7s cubic-bezier(0.4, 0.1, 0.2, 1);
    }

    .kt-stage.flipped .kt-flip {
        transform: rotateY(180deg);
    }

    .kt-face {
        width: 100%;
        display: block;
        backface-visibility: hidden;
        filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.28));
    }

    .kt-back {
        position: absolute;
        inset: 0;
        transform: rotateY(180deg);
    }

    /* Reduced motion: no 3D transition; click still swaps faces instantly. */
    .kt.static .kt-flip {
        transition: none;
    }

    /* Flat export mode: a plain 2D front face. Dropping the 3D context and
       backface-visibility is what makes html-to-image capture reliably. */
    .kt.flat .kt-stage {
        perspective: none;
    }

    .kt.flat .kt-flip {
        transform: none;
        transform-style: flat;
        transition: none;
    }

    .kt.flat .kt-face {
        backface-visibility: visible;
    }

    .kt-text {
        text-align: center;
        max-width: 22rem;
    }

    .kt-to {
        margin: 0 0 0.3rem;
        color: var(--muted);
        font-size: 0.72rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.14em;
    }

    .kt-headline {
        font-size: clamp(1.9rem, 7vw, 2.5rem);
        font-weight: 600;
        letter-spacing: -0.02em;
    }

    .kt-span {
        margin: 0.4rem 0 0;
        color: var(--muted);
        font-size: 0.95rem;
    }

    .kt-msg {
        margin: 1rem 0 0;
        font-family: var(--font-display);
        font-style: italic;
        font-weight: 500;
        font-size: 1.3rem;
        line-height: 1.35;
        color: var(--ink);
    }

    .kt-from {
        margin: 0.6rem 0 0;
        color: var(--muted);
        font-weight: 600;
        letter-spacing: 0.02em;
    }
</style>
