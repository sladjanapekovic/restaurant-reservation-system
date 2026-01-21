module.exports = {
  testEnvironment: "jsdom",
  testMatch: ["**/__tests__/**/*.test.js"],
  collectCoverageFrom: [
    "app.js"
  ],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  coverageDirectory: "coverage/frontend"
};
