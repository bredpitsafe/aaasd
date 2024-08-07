import { sprintf as origSprintf } from 'sprintf-js';

import { sprintf } from './sprintf';

describe('sprintf', () => {
    const tests = [
        {
            format: '',
            args: [],
            expected: '',
        },
        {
            format: 'test: %.6g',
            args: [0.123],
            expected: origSprintf('test: %.6g', 0.123),
        },
        {
            format: 'test: %d',
            args: [1.234],
            expected: origSprintf('test: %d', 1.234),
        },
        {
            format: 'test: %2$d %1$d',
            args: [1, 2],
            expected: origSprintf('test: %d %d', 2, 1),
        },
        {
            format: 'test: %s',
            args: ['string'],
            expected: origSprintf('test: string'),
        },
        {
            format: 'test: %C',
            args: [1_234_567],
            expected: 'test: 1.23M',
        },
        {
            format: 'test: %1.3C',
            args: [1_234_567],
            expected: 'test: 1.235M',
        },
        {
            format: 'test: %M currency',
            args: [1_234_567],
            expected: 'test: 1,234,567.00 currency',
        },
        {
            format: 'test: %1.0M currency',
            args: [1_23],
            expected: 'test: 123 currency',
        },
        {
            format: 'test: %2$.0M, %1$.0C',
            args: [123, 456_000],
            expected: 'test: 456k, 123',
        },
        {
            format: 'test: %s %d',
            args: ['string', 456_000],
            expected: 'test: string 456000',
        },
        {
            format: 'test: %s %.0C',
            args: ['string', 456_000],
            expected: 'test: string 456k',
        },
        {
            format: '%.2f',
            args: [-0.00001],
            expected: '0.00',
        },
        {
            format: '%.3C',
            args: [-0.00001],
            expected: '0.000',
        },
        {
            format: '%.4M',
            args: [-0.00001],
            expected: '0.0000',
        },
    ];

    tests.forEach((testCase) => {
        it(`should format '${testCase.format}'`, () => {
            expect(sprintf(testCase.format, ...testCase.args)).toBe(testCase.expected);
        });
    });
});
