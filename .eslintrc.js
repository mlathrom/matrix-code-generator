module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: ['prettier'],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'prettier/prettier': ['error'],
  },
  parserOptions: {
    parser: 'babel-eslint',
  },
  plugins: ['prettier'],
};
