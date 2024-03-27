import { CircularArray } from './index';

describe('CircularArray', () => {
    it('push + toArray + toCompactArray', () => {
        const cycle = new CircularArray<number>(4);
        const typedCycle = new CircularArray<number>(4, Int32Array);

        cycle.push(1);
        typedCycle.push(1);

        expect(cycle.toArray()).toEqual([1, undefined, undefined, undefined]);
        expect(typedCycle.toArray()).toEqual(Int32Array.from([1, 0, 0, 0]));

        expect(cycle.toCompactArray()).toEqual([1]);
        expect(typedCycle.toCompactArray()).toEqual(Int32Array.from([1]));

        cycle.push(2);
        typedCycle.push(2);
        cycle.push(3);
        typedCycle.push(3);
        cycle.push(4);
        typedCycle.push(4);

        expect(cycle.toArray()).toEqual([1, 2, 3, 4]);
        expect(typedCycle.toArray()).toEqual(Int32Array.from([1, 2, 3, 4]));

        cycle.push(5);
        typedCycle.push(5);

        expect(cycle.toArray()).toEqual([2, 3, 4, 5]);
        expect(typedCycle.toArray()).toEqual(Int32Array.from([2, 3, 4, 5]));

        cycle.push(6);
        typedCycle.push(6);

        expect(cycle.toArray()).toEqual([3, 4, 5, 6]);
        expect(typedCycle.toArray()).toEqual(Int32Array.from([3, 4, 5, 6]));
    });
});
