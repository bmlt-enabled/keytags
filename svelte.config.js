import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

// vitePreprocess lets <script lang="ts"> blocks in .svelte components use
// TypeScript (type-stripping at build time; type-checking is svelte-check's job).
export default {
    preprocess: vitePreprocess(),
};
