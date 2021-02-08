module.exports = {
  transform: {
    ".(ts|tsx)": "ts-jest"
  },
  testTimeout: 20000,
  transformIgnorePatterns: ["json"],
  globals: {
    "ts-jest": {
      tsconfig: "./tsconfig.json"
    }
  },
  setupFilesAfterEnv: ["<rootDir>/src/test.ts"],
  testEnvironment: "node",
  testRegex: "./src.*\\.(test|spec)\\.(ts|tsx|js)$",
  moduleFileExtensions: ["ts", "tsx", "js"],

  moduleNameMapper: {
    "^@elevate/shared/(.*)$": "<rootDir>/../appcore/modules/shared/$1/"
  }
};
