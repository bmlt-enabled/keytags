import { defineConfig } from 'vitest/config';
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
        setupFiles: './src/tests/unit/setup.ts',
        include: ['src/tests/unit/**/*.{test,spec}.{js,ts}'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'cobertura'],
            include: ['src/**/*.{ts,svelte}'],
            exclude: [
                'src/tests/**',
                'src/main.ts',
                'src/lib/types.ts',
                'src/lib/lang/**',
                'src/lib/sprintf.ts',
            ],
            thresholds: {
                lines: 80,
                functions: 80,
                statements: 80,
                branches: 75,
            },
        },
    },
});
