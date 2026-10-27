<script>
    import { decodePayload, buildShareUrl } from './lib/encode.js';
    import { buildCard } from './lib/card.js';
    import Builder from './components/Builder.svelte';
    import KeytagCard from './components/KeytagCard.svelte';
    import DisplayView from './components/DisplayView.svelte';

    let hash = $state(window.location.hash);

    $effect(() => {
        const sync = () => (hash = window.location.hash);
        window.addEventListener('hashchange', sync);
        return () => window.removeEventListener('hashchange', sync);
    });

    const payload = $derived(decodePayload(hash));
    const card = $derived(payload ? buildCard(payload) : null);
    const mode = $derived(payload ? (payload.v === 'display' ? 'display' : 'card') : 'builder');

    function goBuilder() {
        history.pushState(null, '', window.location.pathname + window.location.search);
        hash = '';
    }

    function openDisplay() {
        window.open(buildShareUrl({ ...payload, v: 'display' }), '_blank', 'noopener');
    }
</script>

{#if mode === 'display' && card}
    <DisplayView {card} onexit={goBuilder} />
{:else if mode === 'card' && card}
    <main class="card-page">
        <KeytagCard {card} intro={true} />
        <div class="card-actions">
            <button class="link-btn" onclick={openDisplay}>Open full screen</button>
            <button class="link-btn" onclick={goBuilder}>Create your own →</button>
        </div>
    </main>
{:else}
    <Builder />
{/if}

<style>
    .card-page {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 2rem;
        padding: 3rem 1rem;
    }

    .card-actions {
        display: flex;
        gap: 1.5rem;
        flex-wrap: wrap;
        justify-content: center;
    }

    .link-btn {
        background: none;
        border: none;
        color: var(--accent);
        font-weight: 600;
        font-size: 0.95rem;
        text-decoration: underline;
        text-underline-offset: 3px;
    }
</style>
