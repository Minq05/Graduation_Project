import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      'no-console': 'off',
      'no-lonely-if': 'off',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'no-trailing-spaces': 'off',
      'no-multi-spaces': 'off',
      'no-multiple-empty-lines': 'off',
      'space-before-blocks': 'off',
      'object-curly-spacing': 'off',
      'indent': 'off',
      'semi': 'off',
      'quotes': 'off',
      'array-bracket-spacing': 'off',
      'linebreak-style': 'off',
      'no-unexpected-multiline': 'off',
      'keyword-spacing': 'off',
      'comma-dangle': 'off',
      'comma-spacing': 'off',
      'arrow-spacing': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-inferrable-types': 'off'
    },
  },
)
