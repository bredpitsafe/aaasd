import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { generateTraceId } from './index.ts';

describe('generateTraceId', () => {
    let origMathRandom: () => number;
    let origDateNow: () => number;

    beforeEach(() => {
        origMathRandom = Math.random;
        origDateNow = Date.now;
    });

    afterEach(() => {
        Math.random = origMathRandom;
        Date.now = origDateNow;
    });

    it('should generate a trace id based on the current date and some random number', () => {
        Date.now = () => 1624363947051;

        // (1624363947 & 0x1ffffff) << 38 | (65535 << 22) | (2**22 // 2)
        Math.random = () => 0.5;
        expect(generateTraceId()).toBe('3779904372501118976');

        // Edge case.
        // (1624363947 & 0x1ffffff) << 38 | (65535 << 22) | int(2**22 * 0.999)
        Math.random = () => 0.999;
        expect(generateTraceId()).toBe('3779904372503211933');
    });
});
