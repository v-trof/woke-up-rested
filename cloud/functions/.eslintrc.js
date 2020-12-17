module.exports = {
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'commonjs',
    },

    settings: {
        react: {
            version: 'detect',
        },
    },
    extends: ['plugin:@typescript-eslint/recommended', 'prettier/@typescript-eslint', 'plugin:prettier/recommended'],
    rules: {
        '@typescript-eslint/explicit-module-boundary-types': 'off',
    },
};
