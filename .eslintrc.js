module.exports = {
  root: true,
  env: {
    node: true,
    browser: true,
    es6: true,
  },
  extends: ['prettier'],
  rules: {
    'comma-dangle': ['error', 'never'],
    indent: ['error', 2],
    'max-len': {
      semi: ['error', 'always'],
      code: 80,
      tabWidth: 2,
    },
    quotes: ['error', 'single'],
  },
  parserOptions: {
    parser: 'babel-eslint',
  },
  plugins: ['prettier'],
};
