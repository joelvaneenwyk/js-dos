// @ts-check

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from "globals";

export default tseslint.config(
    eslint.configs.recommended,
    ...tseslint.configs.recommended,
    {
        ignores: ["dist/**/*"],
    },
    {
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.es2021
            },
            ecmaVersion: 'latest',
            sourceType: "module",
        },

        rules: {
            "object-curly-spacing": ["error", "always"],
            "require-jsdoc": "off",
            quotes: ["error", "double"],

            indent: ["error", 4, {
                SwitchCase: 1,

                FunctionDeclaration: {
                    parameters: "first",
                },
            }],

            "max-len": ["error", 120],
        },
    }
);
