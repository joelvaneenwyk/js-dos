// @ts-check

import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from "globals";
import tseslint from 'typescript-eslint';

const baseConfig = tseslint.config(
    eslint.configs.recommended,
    ...tseslint.configs.recommended,
    {
        ignores: ["dist/**/*"],
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.es2021
            },
            ecmaVersion: 'latest',
            sourceType: "module",
        },

        rules: {
            "require-jsdoc": "off",
        },
    }
);

export default [
    ...baseConfig,
    eslintPluginPrettierRecommended,
];
