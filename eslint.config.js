import js from '@eslint/js';
import svelte from 'eslint-plugin-svelte';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

export default [
    js.configs.recommended,
    ...svelte.configs['flat/recommended'],
    prettier,
    ...svelte.configs['flat/prettier'],
    {
        languageOptions: {
            ecmaVersion: 2023,
            sourceType: 'module',
            globals: {
                ...globals.browser,
                ...globals.node,
            },
        },
    },
    {
        // Runes ($state/$props/$effect/…) are compiler macros, not real globals;
        // svelte-check covers undefined references in components.
        files: ['**/*.svelte'],
        rules: {
            'no-undef': 'off',
        },
    },
    {
        rules: {
            'no-unused-vars': [
                'error',
                {
                    argsIgnorePattern: '^_',
                    varsIgnorePattern: '^_',
                    caughtErrorsIgnorePattern: '^_',
                    ignoreRestSiblings: true,
                },
            ],
        },
    },
    {
        ignores: [
            'dist/',
            'coverage/',
            'test-results/',
            'playwright-report/',
            'blob-report/',
            'public/',
            '*.md',
        ],
    },
];
