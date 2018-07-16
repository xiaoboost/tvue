const path = require('path');

module.exports = {
    rootDir: path.resolve(__dirname, '../../'),
    moduleFileExtensions: ['ts', 'tsx', 'js', 'json'],
    moduleNameMapper: {
        '^src/(.*)$': '<rootDir>/src/$1',
        'tvue': '<rootDir>/src/index.ts',
    },
    transform: {
        '^.+\\.(j|t)sx?$': 'ts-jest',
    },
    testRegex: '(\\.|/)(test|spec)\\.ts$',
    setupTestFrameworkScriptFile: 'jest-extended',
    coverageDirectory: '<rootDir>/test/unit/coverage',
    collectCoverageFrom: [
        'src/**/*.ts',
    ],
};
