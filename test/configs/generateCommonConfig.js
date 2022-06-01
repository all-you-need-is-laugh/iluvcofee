const enableCoverage = process.argv.includes('--coverage');

module.exports = (testRegex) => ({
  ...(enableCoverage ? {
    collectCoverageFrom: [
      '**/*.(t|j)s',
      '!**/.*',
      '!.*/**/*',
      '!coverage/**',
      '!dist/**',
      '!test/(configs|utils)/*',
      '!src/app/main.ts',
      '!src/typeorm/migrations/**',
      '!src/typeorm/dataSource.ts',
    ],
    collectCoverage: true,
    coverageThreshold: {
      global: {
        lines: 80
      }
    },
  } : {}),
  moduleFileExtensions: [
    'js',
    'json',
    'ts'
  ],
  rootDir: '../..',
  setupFilesAfterEnv: [ 'jest-extended/all' ],
  testEnvironment: 'node',
  testRegex,
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest'
  },
});
