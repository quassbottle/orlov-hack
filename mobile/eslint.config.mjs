import { defineConfig } from 'eslint/config'
import globals from 'globals'
import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import pluginReact from 'eslint-plugin-react'
import prettierPlugin from 'eslint-plugin-prettier'
import prettierConfig from 'eslint-config-prettier'

export default defineConfig([
    { files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'] },
    {
        files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'],
        languageOptions: { globals: globals.browser },
    },
    {
        files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'],
        plugins: { js },
        extends: ['js/recommended'],
    },
    tseslint.configs.recommended,
    pluginReact.configs.flat.recommended,
    prettierConfig,
    {
        files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'],
        plugins: { prettier: prettierPlugin },
        rules: {
            'prettier/prettier': 'error',
            'prettier/prettier': [{ endOfLine: 'off' }],
        },
    },
    {
        rules: {
            'react/react-in-jsx-scope': 'off',
        },
    },
])
