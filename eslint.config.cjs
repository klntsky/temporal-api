/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: ['standard-with-typescript'],
  parserOptions: { project: ['./tsconfig.json'] },
  rules: {
    '@typescript-eslint/explicit-function-return-type': 'off'
  }
}
