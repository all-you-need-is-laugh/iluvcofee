module.exports = (testRegex, enableCoverage) => ({
  ...(enableCoverage ? {
    collectCoverageFrom: [
      '**/*.(t|j)s',
      '!**/.*',
      '!.*/**/*',
      '!coverage/**',
      '!dist/**',
      '!test/(configs|utils)/*'
    ],
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
