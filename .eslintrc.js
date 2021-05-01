const packageRestrictionRuleConfig = [
  'error',
  [
    {
      name: 'uuid',
      message:
        "'uuid' package needed overrides (like using node bytes that don't reference the MAC address). Please use the generate-random-uuid.ts and generate-secure-unique-uuid.ts files in the project to generate the best uuid for your needs.",
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
    'prettier',
  ],
  root: true,
  env: {
    node: true,
    jest: true,
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
            target: './libs/shared',
            from: '.',
            except: ['./libs/shared', './node_modules'],
          },
          {
            target: './src',
            from: './scripts',
          },
          {
            target: './src',
            from: './scripts-dev',
          },
        ],
      },
    ],
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/require-await': 'off',
    '@typescript-eslint/no-unused-vars': ['error', { args: 'after-used' }],
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
    '@typescript-eslint/no-floating-promises': [
      'error',
      { ignoreVoid: false, ignoreIIFE: false },
    ],
    '@typescript-eslint/no-implicit-any-catch': [
      'error',
      {
        allowExplicitAny: false,
      },
    ],
    '@typescript-eslint/no-unnecessary-condition': 'error',
    '@typescript-eslint/unbound-method': 'error',
    'no-console': 'error',
    'no-debugger': 'error',
    'node/no-process-env': 'error',
    'node/no-restricted-import': packageRestrictionRuleConfig,
    'node/no-restricted-require': packageRestrictionRuleConfig,
  },
};
