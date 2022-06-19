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
    },
    {
      files: ['src/typeorm/migrations/*'],
      rules: {
        'max-len': 'off',
        'spellcheck/spell-checker': 'off'
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
    '@typescript-eslint/await-thenable': 'error',
    'computed-property-spacing': ['error', 'never'],
    '@typescript-eslint/consistent-type-assertions': ['warn', { assertionStyle: 'as', objectLiteralTypeAssertions: 'never' }],
    '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
    'default-param-last': 'off',
    '@typescript-eslint/default-param-last': ['error'],
    'dot-notation': 'off',
    '@typescript-eslint/dot-notation': ['error'],
    'eol-last': ['warn', 'always'],
    'eqeqeq': 'error',
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
    '@typescript-eslint/no-inferrable-types': 'warn',
    '@typescript-eslint/no-explicit-any': 'error',
    'no-multiple-empty-lines': ['warn', { max: 1, maxBOF: 0, maxEOF: 1}],
    'no-return-await': 'off',
    'no-restricted-imports': 'off',
    'no-restricted-syntax': ['error',
      {
        selector: 'VariableDeclaration[kind=let] > VariableDeclarator[init.type="Literal"][init.raw="null"] > Identifier.id:not([typeAnnotation]), VariableDeclaration[kind=let] > VariableDeclarator[init=null] > Identifier.id:not([typeAnnotation]), VariableDeclaration[kind=let] > VariableDeclarator[init.type="Identifier"][init.name="undefined"] > Identifier.id:not([typeAnnotation])',
        message: 'Declared variables must have type or be assigned with value (excluding `null` and `undefined`)'
      },
      {
        selector: 'ImportDeclaration[source.value=@nestjs/config] > ImportSpecifier[imported.name="ConfigModule"]',
        message: 'ConfigModule from @nestjs/config is forbidden - use SharedConfigModule instead'
      },
      {
        selector: 'ImportDeclaration[source.value=@nestjs/typeorm] > ImportSpecifier[imported.name="TypeOrmModule"]',
        message: 'TypeOrmModule from @nestjs/typeorm is forbidden - use SharedTypeOrmModule instead'
      },
      {
        selector: 'ImportDeclaration[source.value=@nestjs/swagger] > ImportSpecifier[imported.name="OmitType"]',
        message: 'OmitType from @nestjs/swagger is forbidden - use PickType with array of needed fields instead'
      },
      {
        selector: 'ImportDeclaration[source.value=@nestjs/mapped-types] > ImportSpecifier[imported.name="OmitType"]',
        message: 'OmitType from @nestjs/mapped-types is forbidden - use PickType with array of needed fields instead'
      }
    ],
    'no-undef': 'error',
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '_.*', ignoreRestSiblings: true }],
    'no-use-before-define': 'off',
    '@typescript-eslint/no-use-before-define': ['error', { typedefs: false }],
    '@typescript-eslint/no-var-requires': 'warn',
    'object-curly-spacing': ['warn', 'always'],
    'object-property-newline': ['warn', { allowAllPropertiesOnSameLine: true} ],
    '@typescript-eslint/prefer-for-of': 'warn',
    'quotes': ['warn', 'single', { allowTemplateLiterals: true, avoidEscape: true }],
    'quote-props': ['error', 'consistent-as-needed'],
    '@typescript-eslint/return-await': ['warn', 'always'],
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
        'argv',
        'charset',
        'cls',
        'dto',
        'enum',
        'iluvcofee',
        'interceptable',
        'keyof',
        'len',
        'localhost',
        'metadatas',
        'metatype',
        'nullable',
        'orm',
        'paramtype',
        'postgres',
        'promisify',
        'readonly',
        'redis',
        'superagent',
        'supertest',
        'ttl',
        'typeorm',
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
