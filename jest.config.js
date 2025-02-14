module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]sx?$': 'babel-jest',
  },
  transformIgnorePatterns: [
    '/node_modules/(?!@middy)'
  ],
  moduleNameMapper: {
    '^@middy/http-cors$': '<rootDir>/__mocks__/middyHttpCorsMock.js',
  },
}; 