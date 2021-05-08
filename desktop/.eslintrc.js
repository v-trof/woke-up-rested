module.exports = {
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        ecmaFeatures: {
            jsx: true,
        },
    },

    plugins: ['simple-import-sort'],
    settings: {
        react: {
            version: 'detect',
        },
    },
    extends: [
        'plugin:react/recommended',
        'plugin:@typescript-eslint/recommended',
        'prettier/@typescript-eslint',
        'plugin:prettier/recommended',
    ],
    rules: {
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        'simple-import-sort/sort': 'error',
        'sort-imports': 'off',
        'import/order': 'off',
    },
};
