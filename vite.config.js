import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

// base: './' keeps all asset references relative so the built site works from
// any static host or subpath without a backend.
export default defineConfig({
    base: './',
    plugins: [svelte()],
});
