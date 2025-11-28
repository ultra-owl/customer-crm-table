module.exports = {
  env: {
    browser: true,
    es2021: true,
  },

  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:jsx-a11y/recommended',
    'plugin:import/recommended',
    'prettier', // MUST BE LAST
  ],

  parserOptions: {
    ecmaFeatures: { jsx: true },
    ecmaVersion: 'latest',
    sourceType: 'module',
  },

  settings: {
    react: { version: 'detect' },
  },

  plugins: ['react', 'jsx-a11y', 'import'],

  rules: {
    'react/prop-types': 'off',
    'react/react-in-jsx-scope': 'off',
    'import/no-unresolved': 'off',
    'no-unused-vars': 'warn',
  },
};
