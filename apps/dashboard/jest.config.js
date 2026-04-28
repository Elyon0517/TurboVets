/** @type {import('jest').Config} */
module.exports = {
  displayName: 'dashboard',
  preset: 'jest-preset-angular',
  testEnvironment: 'jsdom',
  rootDir: '.',
  testMatch: ['**/*.spec.ts'],
  setupFilesAfterFramework: [],
  setupFiles: [],
  setupFilesAfterEach: [],
  moduleNameMapper: {
    '^@org/data$': '<rootDir>/../../libs/data/src/index.ts',
    '^@org/auth$': '<rootDir>/../../libs/auth/src/index.ts',
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
};
