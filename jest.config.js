export const testEnvironment = "node";
export const testRegex = "/test/.*\\.(test|spec)?\\.(ts|tsx)$";
export const moduleFileExtensions = ["ts", "tsx", "js", "jsx", "json", "node"];
export const transform = {
  "^.+\\.jsx?$": "babel-jest",
  "^.+\\.ts?$": "ts-jest",
};
