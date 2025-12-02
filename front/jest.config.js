// jest.config.js
export default {
  testEnvironment: 'node',
  transform: {},  // ← DEIXE ASSIM MESMO
  testMatch: [
    '**/__tests__/**/*.js',
    '**/*.test.js'
  ],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy'
  }
};