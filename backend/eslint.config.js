import js from '@eslint/js';
import globals from 'globals';

export default [
  js.configs.recommended,
  {
    ignores: ['verify-*.js', 'audit-*.js', 'e2e*.js', 'test-*.js', 'tests/**', 'scripts/**']
  },
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node
      }
    },
    rules: {
      'no-unused-vars': 'off',
      'no-empty': 'off',
      'no-console': 'off'
    }
  }
];
