import { generatePixelSizes } from './generatePixelSizes';

describe('generatePixelSizes', () => {
    it('should generate all PixelSizes from second fractions to years', () => {
        expect(generatePixelSizes(0.001, 1)).toEqual([0.001, 0.01, 0.1, 1]);

        expect(generatePixelSizes(0.1, 1e4)).toEqual([0.1, 1, 15, 30, 60, 900, 1800, 3600]);

        expect(generatePixelSizes(1e2, 1e6)).toEqual([
            900, 1800, 3600, 21600, 43200, 86400, 604800,
        ]);

        expect(generatePixelSizes(1e4, 1e8)).toEqual([
            21600, 43200, 86400, 604800, 2592000, 5184000, 7776000, 10368000, 15552000, 31104000,
            62208000, 124416000,
        ]);
    });
});
