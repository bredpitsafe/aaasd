module.exports = {
    extends: ['../../../.eslintrc.js', 'plugin:react-hooks/recommended'],
    rules: {
        'react-hooks/rules-of-hooks': 'error',
        'react-hooks/exhaustive-deps': 'error',
        // Temporarily disable `any` for common code since there's too many errors to fix now
        '@typescript-eslint/no-explicit-any': 'off',
    },
};
