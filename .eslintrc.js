const path = require('path');

module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:vue/recommended",
  ],
  parserOptions: {
    parser: '@babel/eslint-parser',
    requireConfigFile: false,
    babelOptions:
      {
        configFile: path.resolve(__dirname, './babel.config.js')
      }
  },
  rules: {
    "no-console": process.env.NODE_ENV === "production" ? "warn" : "off",
    "no-debugger": process.env.NODE_ENV === "production" ? "warn" : "off",
    "no-unused-vars": ["warn", { "vars": "all", "args": "after-used", "ignoreRestSiblings": false }],
    "vue/no-unused-vars": "warn",
    semi: "warn",
    "vue/max-attributes-per-line": ["error", {
      "singleline": 10,
      multiline: {
        max: 6,
        allowFirstLine: true
      }
    }]
  },
};
