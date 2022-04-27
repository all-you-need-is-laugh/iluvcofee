module.exports = {
  env: {
    jest: true,
    node: true
  },
  extends: ['plugin:@typescript-eslint/recommended'],
  ignorePatterns: ['.eslintrc.js'],
  overrides: [
    {
      files: ['*.js'],
      rules: {
        '@typescript-eslint/no-var-requires': 'off'
      }
    }
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    sourceType: 'module'
  },
  plugins: ['@typescript-eslint/eslint-plugin', 'import', 'spellcheck'],
  root: true,
  rules: {
    'array-bracket-newline': ['warn', { 'minItems': 4, 'multiline': true }],
    'array-bracket-spacing': ['warn', 'always'],
    'array-element-newline': ['warn', 'consistent'],
    'arrow-spacing': 'warn',
    'computed-property-spacing': ['error', 'never'],
    'eol-last': ['warn', 'always'],
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'error',
    'import/named': 'error',
    'import/no-unresolved': 'error',
    'indent': 'off',
    '@typescript-eslint/indent': ['error', 2, { ignoredNodes: ['TemplateLiteral', 'SwitchStatement', 'Identifier'] }],
    '@typescript-eslint/interface-name-prefix': 'off',
    'key-spacing': 'warn',
    'keyword-spacing': 'warn',
    'max-len': ['warn', { 'code': 120 }],
    '@typescript-eslint/naming-convention': [
      'error',
      {
        selector: 'interface',
        format: ['PascalCase'],
        custom: {
          regex: '^I[A-Z]',
          match: false
        }
      }
    ],
    '@typescript-eslint/no-explicit-any': 'error',
    'no-multiple-empty-lines': ['warn', { max: 1, maxBOF: 0, maxEOF: 1}],
    'no-restricted-imports': 'off',
    'no-undef': 'error',
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '_.*' }],
    'object-curly-spacing': ['warn', 'always'],
    'object-property-newline': ['warn', { allowAllPropertiesOnSameLine: true} ],
    'quotes': ['warn', 'single', { 'avoidEscape': true }],
    'semi': ['error', 'always'],
    'sort-keys': ['error', 'asc', { 'caseSensitive': true, 'minKeys': 6, 'natural': true }],
    'space-before-blocks': 'warn',
    'space-before-function-paren': ['warn', 'always'],
    'space-in-parens': ['warn', 'never'],
    'space-infix-ops': ['error', { 'int32Hint': false }],
    'spellcheck/spell-checker': [1, {
      'comments': true,
      'identifiers': true,
      'lang': 'en_US',
      'minLength': 3,
      'skipIfMatch': [
        // Ignore URLs as values
        /^https\S+$/,
      ],
      'skipWordIfMatch': [
        // Ignore words, containing non-latin symbols, like: it’s
        /\b\w*[^\w\s]+\w*\b/,
      ],
      'skipWords': [
        'charset',
        'dto',
        'iluvcofee',
        'interceptable',
        'keyof',
        'len',
        'localhost',
        'nullable',
        'orm',
        'promisify',
        'redis',
        'superagent',
        'supertest',
        'ttl',
        'unknownimize',
        'unref',
        'utf',
        'zadd',
        'zrange',
        'zrem'
      ],
      'strings': true,
      'templates': true
    }],
    'template-curly-spacing': 'off'
  },
  settings: {
    'import/parsers': { '@typescript-eslint/parser': [ '.ts' ] },
    'import/resolver': { 'typescript': { 'alwaysTryTypes': true, } }
  }
};
