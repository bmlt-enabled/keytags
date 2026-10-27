<script lang="ts">
    import { decodePayload, encodePayload, buildShareUrl } from './lib/encode';
    import { buildCard } from './lib/card';
    import { uiStrings } from './lib/ui';
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
    const mode = $derived(!payload ? 'builder' : payload.v === 'display' ? 'display' : 'card');

    // UI strings for the card-page chrome, in the card's own language.
    const t = $derived(uiStrings(card?.lang ?? 'en'));

    // Reflect the card's language on <html> for the card/display views. The
    // builder owns <html lang> while it is mounted (it can change language).
    $effect(() => {
        if (mode === 'card' || mode === 'display') {
            document.documentElement.lang = card?.lang ?? 'en';
        }
    });

    function goBuilder() {
        history.pushState(null, '', window.location.pathname + window.location.search);
        hash = '';
    }

    function openDisplay() {
        window.open(buildShareUrl({ ...payload, v: 'display' }), '_blank', 'noopener');
    }

    // Leaving full-screen returns to this same keytag's card view, not the
    // builder — dropping the `v` flag keeps the card and its message intact.
    function exitDisplay() {
        if (!payload) {
            goBuilder();
            return;
        }
        const { v, ...card } = payload;
        window.location.hash = encodePayload(card);
    }
</script>

{#if mode === 'display' && card}
    <DisplayView {card} onexit={exitDisplay} />
{:else if mode === 'card' && card}
    <main class="card-page">
        <KeytagCard {card} intro={true} />
        <div class="card-actions">
            <button class="link-btn" onclick={openDisplay}>{t.card_fullscreen}</button>
            <button class="link-btn" onclick={goBuilder}>{t.card_create}</button>
        </div>
    </main>
{:else}
    <Builder onreset={goBuilder} />
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
        color: var(--link);
        font-weight: 600;
        font-size: 0.95rem;
        text-decoration: underline;
        text-underline-offset: 3px;
    }
</style>
