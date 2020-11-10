module.exports =
{
  "root": true,
  "extends": "eslint:recommended",
  "parserOptions": {
    "ecmaVersion": 9,
    "ecmaFeatures": {
      "jsx": true
    },
    "sourceType": "module"
  },
  "env": {
    "es6": true,
    "node": true,
    "browser": true,
    "jest/globals": true
  },
  "plugins": ["jest"],

}
