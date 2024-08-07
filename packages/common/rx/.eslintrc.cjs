module.exports = {
    extends: ['../../../.eslintrc.js'],
    rules: {
        // TODO: fix. Temporarily disable `any` for common code since there's too many errors to fix now
        '@typescript-eslint/no-explicit-any': 'off',
    },
};
