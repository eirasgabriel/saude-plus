module.exports = {
  root: true,
  env: {
    browser: true,
    es2022: true,
    node: true,
  },
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: ["react"],
  settings: {
    react: {
      version: "detect",
    },
  },
  ignorePatterns: ["frontend/build/**", "node_modules/**", "backend/data/**"],
  rules: {
    "no-console": "off",
    "no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
    "no-undef": "error",
    "react/jsx-uses-react": "error",
    "react/jsx-uses-vars": "error",
  },
};
