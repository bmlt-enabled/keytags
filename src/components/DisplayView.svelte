<script>
    import KeytagCard from './KeytagCard.svelte';

    /** @type {{ card: object, onexit?: () => void }} */
    let { card, onexit } = $props();
</script>

<div class="display">
    <div class="display-inner">
        <KeytagCard
            {card}
            width="min(380px, 40vh)"
            intro={true}
            interactive={true}
            showText={false}
        />

        <div class="display-text">
            {#if card.to}
                <p class="display-to">For {card.to}</p>
            {/if}
            <h1 class="display-headline">{card.headline}</h1>
            {#if card.timeText.line}
                <p class="display-span">{card.timeText.line}</p>
            {/if}
            {#if card.msg}
                <p class="display-msg">“{card.msg}”</p>
            {/if}
            {#if card.from}
                <p class="display-from">— {card.from}</p>
            {/if}
        </div>
    </div>

    {#if onexit}
        <button class="display-exit" onclick={onexit} aria-label="Exit display view">✕</button>
    {/if}
</div>

<style>
    .display {
        position: fixed;
        inset: 0;
        overflow-y: auto;
        background:
            radial-gradient(130% 90% at 50% 12%, rgba(224, 131, 74, 0.16), transparent 55%),
            radial-gradient(circle at 50% 35%, #2a2015, #0f0b06 72%);
        color: #f7efe2;
        text-align: center;
    }

    /* min-height:100% centers the content when it fits the viewport, and lets the
       container scroll (without clipping the top) when it doesn't. */
    .display-inner {
        min-height: 100%;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 1.5rem;
        padding: 3.5rem 1.5rem;
    }

    .display-text {
        max-width: 42rem;
        /* Break long unbroken words/URLs so user content can't overflow the
           full-screen layout (finding #8); inherited by every line below. */
        overflow-wrap: anywhere;
    }

    .display-to {
        margin: 0 0 0.5rem;
        color: #e8b98c;
        font-size: clamp(0.8rem, 2vw, 1rem);
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.18em;
    }

    .display-headline {
        font-size: clamp(2.4rem, 8vw, 4.5rem);
        font-weight: 600;
        letter-spacing: -0.025em;
    }

    .display-span {
        margin: 0.6rem 0 0;
        color: #d6c6ad;
        font-size: clamp(1rem, 3vw, 1.5rem);
    }

    .display-msg {
        margin: 1.4rem 0 0;
        font-family: var(--font-display);
        font-style: italic;
        font-weight: 500;
        font-size: clamp(1.3rem, 3.5vw, 2rem);
        line-height: 1.3;
    }

    .display-from {
        margin: 0.7rem 0 0;
        font-weight: 600;
        font-size: clamp(1rem, 3vw, 1.4rem);
    }

    .display-exit {
        position: fixed;
        top: 1rem;
        right: 1rem;
        width: 2.75rem;
        height: 2.75rem;
        border-radius: 50%;
        border: 1px solid rgba(255, 255, 255, 0.3);
        background: rgba(255, 255, 255, 0.08);
        color: #fff;
        font-size: 1.1rem;
        line-height: 1;
        z-index: 10;
    }

    .display-exit:hover {
        background: rgba(255, 255, 255, 0.18);
    }
</style>
