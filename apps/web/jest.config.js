module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@selsipad/shared$': '<rootDir>/../../packages/shared/src',
  },
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  // Ignore shared package tests from here
  testPathIgnorePatterns: ['/node_modules/', '/packages/'],
};
