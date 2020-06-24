module.exports = {
  root: true,
  extends: '@react-native-community',
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  rules: {
    curly: ['error', 'multi-line'],
    'react-native/no-inline-styles': 0,
    semi: 0,
  },
};
