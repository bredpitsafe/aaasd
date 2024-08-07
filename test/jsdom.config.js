const hq = require('alias-hq');

module.exports = {
    testEnvironment: 'jsdom',
    transform: {
        '^.+\\.(t|j)sx?$': ['@swc/jest'],
    },
    moduleNameMapper: {
        ...hq.get('jest'),
        '^lodash-es$': 'lodash',
        '^rxjs$': '<rootDir>../../../node_modules/rxjs/dist/cjs/index.js',
        '^rxjs(.*)$': '<rootDir>../../../node_modules/rxjs/dist/cjs/$1',
    },
    testPathIgnorePatterns: ['!node_modules/'],
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    setupFiles: ['<rootDir>../../../test/pixi.setup.js'],
    testMatch: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],
};
