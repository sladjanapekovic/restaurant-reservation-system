module.exports = {
  testEnvironment: "jsdom",
  testMatch: ["<rootDir>/__tests__/**/*.test.js"],
  collectCoverage: true,
  collectCoverageFrom: ["<rootDir>/app.js"],
  coverageDirectory: "coverage/frontend",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"]
};
