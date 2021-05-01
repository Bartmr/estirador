module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin', 'import', 'node'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:react/recommended',
    'react-app',
    'plugin:jsx-a11y/strict',
    'prettier',
  ],
  globals: {
    __PATH_PREFIX__: true,
  },
  settings: {
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx'],
    },
    'import/resolver': {
      typescript: {},
    },
  },
  rules: {
    'import/no-restricted-paths': [
      'error',
      {
        zones: [
          {
            target: '.',
            from: '../..',
            except: [
              './node_modules',
              './client-side/web-app',
              './libs/shared',
            ],
          },
        ],
      },
    ],
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/require-await': 'off',
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        args: 'after-used',
        /*
          Router forces to pass route params and specifications
          as props to the component implementation, even if the former
          does not use such props
        */
        argsIgnorePattern: '^_',
      },
    ],
    '@typescript-eslint/ban-types': 'off',
    '@typescript-eslint/no-inferrable-types': 'off',
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-unsafe-assignment': 'error',
    '@typescript-eslint/no-unsafe-call': 'error',
    '@typescript-eslint/no-unsafe-member-access': 'error',
    '@typescript-eslint/no-unsafe-return': 'error',
    '@typescript-eslint/restrict-template-expressions': [
      'error',
      { allowNumber: true, allowNullish: false },
    ],
    '@typescript-eslint/no-implicit-any-catch': [
      'error',
      {
        allowExplicitAny: false,
      },
    ],
    '@typescript-eslint/no-floating-promises': [
      'error',
      { ignoreVoid: false, ignoreIIFE: true },
    ],
    '@typescript-eslint/no-unnecessary-condition': 'error',
    '@typescript-eslint/unbound-method': 'error',
    'no-console': 'error',
    'no-debugger': 'error',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'off',
    'react/no-array-index-key': 'error',
    'react/jsx-key': ['error', { checkFragmentShorthand: true }],
    'jsx-a11y/no-autofocus': 'off',
    'node/no-process-env': 'error',
    'react/no-unescaped-entities': 'error',
    'react/prop-types': 'off',
    'react/jsx-uses-react': 'off',
    'react/react-in-jsx-scope': 'off',
    'react/display-name': 'off',
    'jsx-a11y/no-onchange': 'off',
    'jsx-a11y/no-noninteractive-element-to-interactive-role': [
      'error',
      {
        ul: [
          'listbox',
          'menu',
          'menubar',
          'radiogroup',
          'tablist',
          'tree',
          'treegrid',
        ],
        ol: [
          'listbox',
          'menu',
          'menubar',
          'radiogroup',
          'tablist',
          'tree',
          'treegrid',
        ],
        li: ['menuitem', 'option', 'row', 'tab', 'treeitem'],
        table: ['grid'],
        td: ['gridcell'],
        fieldset: ['radiogroup', 'presentation'],
      },
    ],
  },
};
