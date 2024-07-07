// @ts-check

import eslint from "@eslint/js";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import globals from "globals";
import tseslint from "typescript-eslint";

export default [
    {
        ignores: ["dist/**/*"],
    },
    eslint.configs.recommended,
    ...tseslint.configs.recommended,
    {
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.es2021,
            },
            ecmaVersion: "latest",
            sourceType: "module",
        },

        rules: {
            "require-jsdoc": "off",
            "no-dupe-keys": "off",
            "@typescript-eslint/no-this-alias": "off",
            "no-redeclare": "off",
            "no-empty": "off",
            "@typescript-eslint/no-unused-vars": "off",
            "no-fallthrough": "off",
            "no-constant-condition": "off",
            "no-unreachable": "off",
            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/ban-types": "off",
            "@typescript-eslint/no-var-requires": "off",
            "no-undef": "off",
        },
    },
    eslintPluginPrettierRecommended,
];
