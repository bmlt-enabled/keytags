/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { svelteTesting } from '@testing-library/svelte/vite';

// base: './' keeps all asset references relative so the built site works from
// any static host or subpath without a backend.
export default defineConfig({
    base: './',
    plugins: [svelte(), svelteTesting()],
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: './src/tests/unit/setup.js',
        include: ['src/tests/unit/**/*.{test,spec}.{js,svelte.js}'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'cobertura'],
            include: ['src/**/*.{js,svelte}'],
            exclude: ['src/tests/**', 'src/main.js', 'src/lib/lang/**', 'src/lib/sprintf.js'],
            thresholds: {
                lines: 80,
                functions: 80,
                statements: 80,
                branches: 75,
            },
        },
    },
});
