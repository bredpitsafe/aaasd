import { isDeepObjectEmpty } from './isDeepObjectEmpty.ts';

test.each([
    [0, false],
    ['test', false],
    ['', false],
    [{ a: {}, b: { c: { x: 5 } } }, false],
    [{ a: {}, b: { c: { x: undefined, z: 6 } } }, false],
    [{ a: {}, b: { c: { x: undefined, z: new Date() } } }, false],
    [{ a: {}, b: { c: { x: undefined, z: [5] } } }, false],
    [{}, true],
    [{ a: {}, b: { c: {} }, x: undefined, z: undefined }, true],
    [{ a: {}, b: { c: { x: undefined } } }, true],
    [{ a: {}, b: { c: { x: undefined, z: undefined } } }, true],
    [{ a: {}, b: { c: { x: undefined, z: [] } } }, true],
])('%# isDeepEmpty check', (value, expected) => {
    expect(isDeepObjectEmpty(value)).toBe(expected);
});
