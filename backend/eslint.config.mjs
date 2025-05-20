// @ts-check
import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['eslint.config.mjs'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  eslintPluginPrettierRecommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: 'commonjs',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    rules: {
      'max-len': [
        'error',
        120,
        {
          ignorePattern: '^import\\s.+\\sfrom\\s.+;$',
          ignoreUrls: true,
        },
      ],
      '@typescript-eslint/interface-name-prefix': 'off',
      '@typescript-eslint/no-unsafe-call': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/array-type': [
        'error',
        {
          default: 'generic',
        },
      ],
      '@typescript-eslint/no-empty-function': [
        'error',
        { allow: ['constructors'] },
      ],
      '@typescript-eslint/no-empty-interface': 'off',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-for-in-array': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/restrict-plus-operands': 'error',
      'deprecation/deprecation': 'warn',
      'no-console': 'error',
      'no-empty': 'error',
      'no-shadow': [
        'off',
        {
          hoist: 'all',
        },
      ],
      '@typescript-eslint/no-namespace': ['off'],
      'prettier/prettier': ['error', { endOfLine: 'auto' }],
    },
  },
);
