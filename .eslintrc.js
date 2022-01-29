module.exports = {
    extends: ['alloy', 'alloy/typescript', 'plugin:prettier/recommended'],
    env: {
        node: true,
        browser: true,
        commonjs: true,
        mocha: true,
    },
    globals: {},
    rules: {
        'guard-for-in': 'off',
        'array-callback-return': 'off',
        '@typescript-eslint/explicit-member-accessibility': [
            'error',
            {
                accessibility: 'no-public',
            },
        ],
        '@typescript-eslint/consistent-type-assertions': 'off',
        '@typescript-eslint/class-literal-property-style': 'off',
    },
};
