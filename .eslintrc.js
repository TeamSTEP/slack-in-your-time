module.exports = {
    parser: '@typescript-eslint/parser', // Specifies the ESLint parser
    root: true,
    env: {
        es6: true,
        node: true,
    },
    extends: [
        'eslint:recommended',
        'plugin:import/errors',
        'plugin:import/warnings',
        'plugin:import/typescript',
        'plugin:@typescript-eslint/recommended',
        'plugin:prettier/recommended',
    ],
    parserOptions: {
        ecmaVersion: 2018, // Allows for the parsing of modern ECMAScript features
        sourceType: 'module', // Allows for the use of imports
    },
    plugins: ['@typescript-eslint', 'import', 'prettier'],
    ignorePatterns: [
        'dist/**/*', // Ignore built files.
        'node_modules', // Ignore packages
    ],
    rules: {
        // Place to specify ESLint rules. Can be used to overwrite rules specified from the extended configs
        // e.g. "@typescript-eslint/explicit-function-return-type": "off",
        quotes: ['error', 'single'],
        semi: ['error', 'always'],
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/no-unused-vars': 'warn',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
    },
};
