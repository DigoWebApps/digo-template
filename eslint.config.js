import js               from '@eslint/js';
import globals          from 'globals';
import reactHooks       from 'eslint-plugin-react-hooks';
import reactRefresh     from 'eslint-plugin-react-refresh';
import tseslint         from 'typescript-eslint';
import stylistic        from '@stylistic/eslint-plugin';
import stylisticJsx     from '@stylistic/eslint-plugin-jsx';
import alignAssignments from 'eslint-plugin-align-assignments';
import alignImport      from 'eslint-plugin-align-import';

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  stylistic.configs['recommended-flat'],
  {
    files: ['**/*.{ts,tsx,jsx,js}'],

    ignores:         ['dist'],
    languageOptions: {
      ecmaVersion: 2020,
      globals:     globals.browser,
    },
    plugins: {
      '@stylistic':        stylistic,
      '@stylistic/jsx':    stylisticJsx,
      'react-hooks':       reactHooks,
      'react-refresh':     reactRefresh,
      'align-assignments': alignAssignments,
      'align-import':      alignImport,
    },
  },
  {
    rules: {
      'align-assignments/align-assignments':     [2],
      'align-import/align-import':               2,
      'object-curly-newline':                    ['error', { multiline: true, consistent: true }],
      'array-bracket-newline':                   ['error', { multiline: true }],
      'array-element-newline':                   ['error', 'consistent'],
      'function-paren-newline':                  ['error', 'consistent'],
      'comma-dangle':                            ['error', 'always-multiline'],
      'no-unused-private-class-members':         ['error'],
      'quotes':                                  ['error', 'single', { avoidEscape: true }],
      'no-undef':                                0,
      'react-refresh/only-export-components':    ['off', { allowConstantExport: true }],
      '@typescript-eslint/no-explicit-any':      'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-unused-vars':       [
        'warn',
        {
          args:                           'all',
          argsIgnorePattern:              '^_',
          caughtErrors:                   'all',
          caughtErrorsIgnorePattern:      '^_',
          destructuredArrayIgnorePattern: '^_',
          varsIgnorePattern:              '^_',
          ignoreRestSiblings:             true,
        },
      ],

      '@stylistic/no-multi-spaces':           [0, { exceptions: { Property: true, VariableDeclarator: true, ImportDeclaration: true, BinaryExpression: true } }],
      '@stylistic/semi':                      ['error', 'always'],
      '@stylistic/key-spacing':               [2, { align: 'value' }],
      '@stylistic/brace-style':               'off',
      '@stylistic/newline-per-chained-call':  'off',
      '@stylistic/operator-linebreak':        'off',
      '@stylistic/jsx-wrap-multilines':       'off',
      '@stylistic/jsx/jsx-self-closing-comp': [
        'error',
        {
          component: true,
          html:      true,
        },
      ],
      '@stylistic/member-delimiter-style': [
        'error', {
          multiline: {
            delimiter:   'semi',
            requireLast: true,
          },
          singleline: {
            delimiter:   'semi',
            requireLast: true,
          },
          multilineDetection: 'brackets',
        },
      ],
    },
  },
);
