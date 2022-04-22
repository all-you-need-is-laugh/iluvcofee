module.exports = (testRegex, enableCoverage) => ({
  ...(enableCoverage ? {
    collectCoverageFrom: [
      '**/*.(t|j)s',
      '!**/.*',
      '!.*/**/*',
      '!coverage/**',
      '!test/(configs|utils)/*'
    ],
    coverageDirectory: 'coverage',
  } : {}),
  moduleFileExtensions: [
    'js',
    'json',
    'ts'
  ],
  rootDir: '../..',
  testEnvironment: 'node',
  testRegex,
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest'
  }
});
