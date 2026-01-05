module.exports = {
  clearMocks: true,
  testEnvironment: "node",
  transform: {
    "^.+\\.[jt]sx?$": "babel-jest",
  },
  transformIgnorePatterns: ["/node_modules/(?!uuid)/"],
};
