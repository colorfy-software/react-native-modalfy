module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  extends: ['@react-native-community', 'prettier'],
  plugins: ['@typescript-eslint'],
  rules: {
    curly: ['error', 'multi-line'],
    'react-native/no-inline-styles': 0,
    semi: 0,
  },
}
