const packageRestrictionRuleConfig = [
  'error',
  [
    {
      name: 'uuid',
      message:
        'Please use the generate-random-uuid and generate-unique-uuid modules in src/internals/utils to generate the best uuid for your needs.',
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
            from: '.',
            except: ['./src', './libs/shared', './node_modules'],
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
    '@typescript-eslint/no-unsafe-argument': 'error',
    '@typescript-eslint/restrict-template-expressions': [
      'error',
      { allowNumber: true, allowNullish: false },
    ],
    '@typescript-eslint/no-floating-promises': [
      'error',
      { ignoreVoid: false, ignoreIIFE: false },
    ],
    '@typescript-eslint/no-unnecessary-condition': 'error',
    '@typescript-eslint/unbound-method': 'error',
    '@typescript-eslint/no-shadow': 'error',
    'no-console': 'error',
    'no-debugger': 'error',
    'node/no-process-env': 'error',
    'node/no-restricted-import': packageRestrictionRuleConfig,
    'node/no-restricted-require': packageRestrictionRuleConfig,
  },
};
