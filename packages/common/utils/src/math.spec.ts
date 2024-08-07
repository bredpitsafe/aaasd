import {
    areEqualWithTolerance,
    getEdgeNumberPosition,
    getFractionDigitsCount,
    getMeaningDifference,
    getRealExponent,
} from './math';

test.each([
    [1, 1],
    [2, 1],
    [10, 2],
    [10.0001, 2],
    [100, 3],
    [110, 3],
    [1000, 4],
    [4000, 4],
    [9999, 4],
    [1.0001, 1],
    [0.0001, -4],
    [0.00012301, -4],
    [0, 0],
    [-1, 1],
    [-2, 1],
    [-10, 2],
    [-10.0001, 2],
    [-100, 3],
    [-110, 3],
    [-1000, 4],
    [-4000, 4],
    [-9999, 4],
    [-1.0001, 1],
    [-0.0001, -4],
    [-0.00012301, -4],
    [NaN, NaN],
    [Infinity, Infinity],
    [-Infinity, Infinity],
])('getEdgeNumberPosition checks exponent for %f', (value, expected) => {
    expect(getEdgeNumberPosition(value)).toBe(expected);
});

test.each([
    [1, 0],
    [2, 0],
    [10, 1],
    [10.0001, 1],
    [100, 2],
    [110, 2],
    [1000, 3],
    [4000, 3],
    [9999, 3],
    [1.0001, 0],
    [0.0001, -4],
    [0.00012301, -4],
    [0, 0],
    [-1, 0],
    [-2, 0],
    [-10, 1],
    [-10.0001, 1],
    [-100, 2],
    [-110, 2],
    [-1000, 3],
    [-4000, 3],
    [-9999, 3],
    [-1.0001, 0],
    [-0.0001, -4],
    [-0.00012301, -4],
    [NaN, NaN],
    [Infinity, Infinity],
    [-Infinity, Infinity],
])('getRealExponent checks exponent for %f', (value, expected) => {
    expect(getRealExponent(value)).toBe(expected);
});

test.each([
    [1, 9, 1e-8],
    [1000, 9, 1e-5],
    [4000, 9, 1e-5],
    [9999, 9, 1e-5],
    [1.0001, 9, 1e-8],
    [0.0001, 9, 1e-13],
    [0.00012301, 9, 1e-13],
    [0, 9, 1e-9],
    [-1000, 9, 1e-5],
    [-4000, 9, 1e-5],
    [-9999, 9, 1e-5],
    [-1.0001, 9, 1e-8],
    [-0.0001, 9, 1e-13],
    [-0.00012301, 9, 1e-13],
    [1e16, 16, 10],
    [NaN, 9, NaN],
    [Infinity, 9, NaN],
    [-Infinity, 9, NaN],
])('getMeaningDifference checks meaning difference for %f', (value, factor, expected) => {
    expect(getMeaningDifference(value, factor)).toBe(expected);
});

test.each([
    [1, 1, 0.5, true],
    [4.0123456790123455e-14, 4.012345679012345e-14, 1e-18, true],
    [5, 5.00000000000001, 1e-10, true],
    [4.0123456790123455e-14, 5.012345679012345e-14, 1e-15, false],
    [Infinity, 1, 0, false],
    [1, Infinity, 0, false],
    [NaN, 1, 0, false],
    [1, NaN, 0, false],
    [NaN, NaN, 0, false],
])(
    'areEqualWithTolerance checks for equality of %f and %f',
    (first, second, insignificantDifference, expected) => {
        expect(areEqualWithTolerance(first, second, insignificantDifference)).toBe(expected);
    },
);

test.each([
    { value: 0, expected: 0 },
    { value: 1000, expected: 0 },
    { value: 1000.231e3, expected: 0 },
    { value: 1000.231e4, expected: 0 },
    { value: 1000.231e45, expected: 0 },
    { value: 1000.231e2, expected: 1 },
    { value: 1.231, expected: 3 },
    { value: parseFloat('1.23198237492374982374'), expected: 16 },
    { value: 1.231e-7, expected: 10 },
    { value: 10000000000000000000000000000, expected: 0 },
    { value: parseFloat('10000000000000000000000000000.11'), expected: 0 },
    { value: 0.00000000000000000000000000001, expected: 29 },
    { value: 1e-44, expected: 44 },
    { value: NaN, expected: NaN },
    { value: Number.POSITIVE_INFINITY, expected: NaN },
    { value: 0.0000012897499999999998, expected: 22 },
])('getFractionDigitsCount $value', ({ value, expected }) => {
    expect(getFractionDigitsCount(value)).toBe(expected);
    expect(getFractionDigitsCount(-value)).toBe(expected);
});
