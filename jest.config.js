module.exports = {
  testEnvironment: "jsdom",
  testMatch: ["**/__tests__/**/*.test.js"],
  collectCoverageFrom: [
    "app.js"
  ],
  coverageDirectory: "coverage/frontend"
};
