module.exports = {
  extends: [
    'react-app',
    'react-app/jest'
  ],
  globals: {
    BigInt: 'readonly',
    globalThis: 'readonly',
    SharedArrayBuffer: 'readonly'
  },
  ignorePatterns: ['dist/**/*']
}; 
