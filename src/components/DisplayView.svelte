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
            {#if card.timeText.main}
                <p class="display-span">{card.timeText.main}</p>
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
        background: radial-gradient(circle at 50% 30%, #2a2740, #100f17 70%);
        color: #fff;
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
    }

    .display-to {
        margin: 0 0 0.4rem;
        color: #c9c3e6;
        font-size: clamp(1rem, 3vw, 1.3rem);
        letter-spacing: 0.04em;
    }

    .display-headline {
        font-size: clamp(2.2rem, 7vw, 4rem);
        font-weight: 800;
        letter-spacing: -0.02em;
    }

    .display-span {
        margin: 0.5rem 0 0;
        color: #c9c3e6;
        font-size: clamp(1rem, 3vw, 1.5rem);
    }

    .display-msg {
        margin: 1.2rem 0 0;
        font-style: italic;
        font-size: clamp(1.1rem, 3vw, 1.7rem);
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
