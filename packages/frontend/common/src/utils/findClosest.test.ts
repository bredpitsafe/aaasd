import {
    decreaseIndexWhileBigger,
    decreaseIndexWhileEqual,
    findFirstLeftNotEqualTo,
    findFirstRightNotEqualTo,
    findLeftClosestIndex,
    findRightIndexByEqual,
    increaseIndexWhileEqual,
    increaseIndexWhileLower,
} from './findClosest';

const ITEM_SIZE = 2;
const createArray = (len: number, repeats: number): number[] => {
    return new Array(len).fill(1).map((v, i) => {
        const n = Math.floor(i / 2);
        return (n - (n % repeats)) / repeats;
    });
};

const size = 1e3;
const items = createArray(size * 2, 1);
const repeatedItems = createArray(size * 2, 4);

const findFirstClosest = (items: number[], time: number) => {
    const closest = findLeftClosestIndex(time, items, ITEM_SIZE);
    return decreaseIndexWhileEqual(closest, items, ITEM_SIZE);
};

const findLastClosest = (items: number[], time: number) => {
    const closest = findLeftClosestIndex(time, items, ITEM_SIZE);
    return increaseIndexWhileEqual(closest, items, ITEM_SIZE);
};

const findLeftClosest = (items: number[], time: number) => {
    const closest = findLeftClosestIndex(time, items, ITEM_SIZE);
    return decreaseIndexWhileBigger(time, closest, items, ITEM_SIZE);
};

const findRightClosest = (items: number[], time: number) => {
    const leftClosestIndex = findLeftClosestIndex(time, items, ITEM_SIZE);
    const rightestClosestIndex = increaseIndexWhileLower(time, leftClosestIndex, items, ITEM_SIZE);

    return findRightIndexByEqual(rightestClosestIndex, items, ITEM_SIZE);
};

describe('findClosest', () => {
    test('findClosestIndexByTime, different answer for repeatable points', function () {
        expect(findLeftClosestIndex(99, items, ITEM_SIZE, 0)).toEqual(99);
        expect(findLeftClosestIndex(199, items, ITEM_SIZE, 0)).toEqual(199);
    });

    test('decreaseWhileEqual', function () {
        expect(findFirstClosest(items, 0)).toEqual(0);
        expect(findFirstClosest(items, 100)).toEqual(100);
        expect(findFirstClosest(items, -1e10)).toEqual(0);
        expect(findFirstClosest(items, 1e10)).toEqual(999);

        expect(findFirstClosest(repeatedItems, 0)).toEqual(0);
        expect(findFirstClosest(repeatedItems, 100)).toEqual(400);
        expect(findFirstClosest(repeatedItems, -1e10)).toEqual(0);
        expect(findFirstClosest(repeatedItems, 1e10)).toEqual(996);
    });

    test('increaseWhileEqual', function () {
        expect(findLastClosest(items, 0)).toEqual(0);
        expect(findLastClosest(items, 100)).toEqual(100);
        expect(findLastClosest(items, -1e10)).toEqual(0);
        expect(findLastClosest(items, 1e10)).toEqual(999);

        expect(findLastClosest(repeatedItems, 0)).toEqual(3);
        expect(findLastClosest(repeatedItems, 100)).toEqual(403);
        expect(findLastClosest(repeatedItems, -1e10)).toEqual(3);
        expect(findLastClosest(repeatedItems, 1e10)).toEqual(999);
    });

    test('decreaseWhileBigger', function () {
        expect(findLeftClosest(items, 100)).toEqual(100);
        expect(findLeftClosest(items, 99.9)).toEqual(99);
        expect(findLeftClosest(items, 99.1)).toEqual(99);

        expect(findLeftClosest(items, -1e10)).toEqual(-1);
        expect(findLeftClosest(items, 1e10)).toEqual(999);

        expect(findLeftClosest(repeatedItems, 100)).toEqual(400);
        expect(findLeftClosest(repeatedItems, 99.9)).toEqual(399);
        expect(findLeftClosest(repeatedItems, 99.1)).toEqual(396);

        expect(findLeftClosest(repeatedItems, -1e10)).toEqual(-1);
        expect(findLeftClosest(repeatedItems, 1e10)).toEqual(996);
    });

    test('increaseWhileLower', function () {
        expect(findRightClosest(items, 99.9)).toEqual(100);
        expect(findRightClosest(items, 99.1)).toEqual(100);
        expect(findRightClosest(items, 99)).toEqual(99);

        expect(findRightClosest(items, -1e10)).toEqual(0);
        expect(findRightClosest(items, 1e10)).toEqual(-1);

        expect(findRightClosest(repeatedItems, 99.9)).toEqual(403);
        expect(findRightClosest(repeatedItems, 99.1)).toEqual(403);
        expect(findRightClosest(repeatedItems, 99)).toEqual(399);

        expect(findRightClosest(repeatedItems, -1e10)).toEqual(3);
        expect(findRightClosest(repeatedItems, 1e10)).toEqual(-1);
    });

    test('decreaseWhileEqual + decreaseWhileBigger', function () {
        const find = (items: number[], time: number) => {
            const i1 = findLeftClosestIndex(time, items, ITEM_SIZE);
            const i2 = decreaseIndexWhileEqual(i1, items, ITEM_SIZE);
            const i3 = decreaseIndexWhileBigger(
                time,
                i2,

                items,
                ITEM_SIZE,
            );
            return decreaseIndexWhileEqual(i3, items, ITEM_SIZE);
        };

        expect(find(repeatedItems, 100)).toEqual(400);
        expect(find(repeatedItems, 99.9)).toEqual(396);
        expect(find(repeatedItems, 99.1)).toEqual(396);

        expect(find(repeatedItems, -1e10)).toEqual(-1);
        expect(find(repeatedItems, 1e10)).toEqual(996);
    });

    test('increaseWhileEqual + increaseWhileLower', function () {
        const find = (items: number[], time: number) => {
            const i1 = findLeftClosestIndex(time, items, ITEM_SIZE);
            const i2 = increaseIndexWhileEqual(i1, items, ITEM_SIZE);
            const i3 = increaseIndexWhileLower(time, i2, items, ITEM_SIZE);
            return increaseIndexWhileEqual(i3, items, ITEM_SIZE);
        };

        expect(find(repeatedItems, 100)).toEqual(403);
        expect(find(repeatedItems, 99.9)).toEqual(403);
        expect(find(repeatedItems, 99.1)).toEqual(403);

        expect(find(repeatedItems, -1e10)).toEqual(3);
        expect(find(repeatedItems, 1e10)).toEqual(-1);
    });

    test('findFirstLeftNotEqualTo', function () {
        const find = (itemsWithNaN: number[], value: number) => {
            return findFirstLeftNotEqualTo(
                value,
                itemsWithNaN.length / ITEM_SIZE - 1,
                itemsWithNaN,
                ITEM_SIZE,
                1,
            );
        };

        expect(find([0, 100, 1, 200, 2, 300, 3, 400, 4, 500], NaN)).toEqual(4);
        expect(find([0, 100, 1, 200, 2, 300, 3, 400, 4, 500], 5)).toEqual(4);
        expect(find([0, 100, 1, NaN, 2, NaN, 3, NaN, 4, NaN], NaN)).toEqual(0);
        expect(find([0, 100, 1, 200, 2, 5, 3, 5, 4, 5], 5)).toEqual(1);
        expect(find([0, 5, 1, 5, 2, 5, 3, 5, 4, 5], 5)).toEqual(-1);
        expect(find([0, NaN, 1, NaN, 2, NaN, 3, NaN, 4, NaN], NaN)).toEqual(-1);
    });

    test('findFirstRightNotEqualTo', function () {
        const find = (itemsWithNaN: number[], value: number) => {
            return findFirstRightNotEqualTo(value, 0, itemsWithNaN, ITEM_SIZE, 1);
        };

        expect(find([0, 100, 1, 100, 2, 100, 3, 200, 4, 300], NaN)).toEqual(0);
        expect(find([0, 100, 1, 100, 2, 100, 3, 200, 4, 300], 5)).toEqual(0);
        expect(find([0, NaN, 1, NaN, 2, NaN, 3, NaN, 4, 300], NaN)).toEqual(4);
        expect(find([0, 5, 1, 5, 2, 100, 3, 200, 4, 300], 5)).toEqual(2);
        expect(find([0, 5, 1, 5, 2, 5, 3, 5, 4, 5], 5)).toEqual(-1);
        expect(find([0, NaN, 1, NaN, 2, NaN, 3, NaN, 4, NaN], NaN)).toEqual(-1);
    });
});
