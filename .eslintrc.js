module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  extends: '@react-native-community',
  plugins: ['@typescript-eslint'],
  rules: {
    curly: ['error', 'multi-line'],
    'react-native/no-inline-styles': 0,
    semi: 0,
  },
}
