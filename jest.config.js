module.exports = {
  testEnvironment: "node",
  testRegex: "/test/.*\\.(test|spec)?\\.(ts|tsx)$",
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  transform: {
    "^.+\\.jsx?$": "babel-jest",
    "^.+\\.ts?$": "ts-jest",
  },
};
