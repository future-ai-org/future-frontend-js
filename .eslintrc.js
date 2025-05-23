module.exports = {
  extends: [
    'next/core-web-vitals',
    'plugin:@typescript-eslint/recommended'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    configArray: '@eslint/config-array'
  },
  plugins: ['@typescript-eslint'],
  rules: {
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/no-explicit-any': 'warn'
  },
  globals: {
    BigInt: 'readonly',
    globalThis: 'readonly',
    SharedArrayBuffer: 'readonly'
  },
  ignorePatterns: ['dist/**/*']
}; 
