const packageRestrictionRuleConfig = [
  'error',
  [
    {
      name: '@hookform/devtools',
      message:
        'It should only be used during development, or else it will end up in the production bundle',
    },
  ],
];

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
    '@typescript-eslint/no-unsafe-argument': 'error',
    '@typescript-eslint/restrict-template-expressions': [
      'error',
      { allowNumber: true, allowNullish: false },
    ],
    '@typescript-eslint/no-floating-promises': [
      'error',
      { ignoreVoid: false, ignoreIIFE: true },
    ],
    '@typescript-eslint/no-unnecessary-condition': 'error',
    '@typescript-eslint/unbound-method': 'error',
    '@typescript-eslint/no-shadow': 'error',
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
    /*
      Rule is deprecated.
      plugin:jsx-a11y/strict has label-has-associated-control enabled instead.
    */
    'jsx-a11y/label-has-for': 'off',
    //
    'no-restricted-globals': [
      'error',
      {
        name: 'localStorage',
        message:
          'Use the local storage instance returned by the useLocalStorage hook at client-side/web-app/src/logic/app-internals/transports/use-local-storage',
      },
      {
        name: 'sessionStorage',
        message:
          'Use the session storage instance returned by the useSessionStorage hook at client-side/web-app/src/logic/app-internals/transports/use-session-storage',
      },
    ],
    'node/no-restricted-import': packageRestrictionRuleConfig,
    'node/no-restricted-require': packageRestrictionRuleConfig,
  },
};
