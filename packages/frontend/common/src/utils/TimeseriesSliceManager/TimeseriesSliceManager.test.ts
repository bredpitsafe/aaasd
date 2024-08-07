import type { ISO, Milliseconds } from '@common/types';
import { iso2milliseconds, NanoDate, plus, sumDates, toISO } from '@common/utils';

import { TimeseriesSliceManager } from './index';

type TItem = {
    id: number;
    ts: ISO;
};

const START = Math.round(Date.now() / 2) as Milliseconds;
const DURATION = 60_000 as Milliseconds;
const END = plus(START, DURATION);
const START_ISO = toISO(START);
const END_ISO = toISO(END);
const generateItems = (start: Milliseconds, duration: Milliseconds, count: number) => {
    const delta = (duration / count) as Milliseconds;
    return Array.from(
        { length: count },
        (_, i) => ({ id: i, ts: new Date(start + delta * i).toISOString() }) as TItem,
    );
};
const generateCompactItems = (count = 10) => {
    const points1 = generateItems(START, DURATION, count);
    const points2 = generateItems(iso2milliseconds(points1[points1.length - 1].ts), DURATION, 10);
    const points3 = generateItems(iso2milliseconds(points2[points2.length - 1].ts), DURATION, 10);
    return [points1, points2, points3];
};

describe('TimeseriesSliceManager', () => {
    const keeper = new TimeseriesSliceManager<TItem>({
        getId: (v) => v.id,
        getTime: (v) => v.ts,
    });

    beforeEach(() => {
        keeper.clear();
    });

    // TODO: add tests for overlapping cases
    // TODO: add tests for points with same ts

    describe('write', () => {
        it('add at empty keeper', () => {
            const points = generateItems(START, DURATION, 10);
            keeper.addItems(points);
            const slices = keeper.getAllSlices();

            expect(slices.length).toBe(3);

            expect(slices[0].rightBound).toBe(START_ISO);
            expect(slices[0].rightBoundInclude).toBeFalsy();

            expect(slices[1].leftBound).toBe(START_ISO);
            expect(slices[1].leftBoundInclude).toBeTruthy();
            expect(slices[1].rightBound).toBe(points[points.length - 1].ts);
            expect(slices[1].rightBoundInclude).toBeTruthy();
            expect(slices[1].items).toEqual(points);

            expect(slices[2].leftBound).toBe(points[points.length - 1].ts);
            expect(slices[2].leftBoundInclude).toBeFalsy();
        });

        it('add few compact slices', () => {
            const [points1, points2, points3] = generateCompactItems();

            points2[0] = points1[points1.length - 1];
            points3[0] = points2[points2.length - 1];

            keeper.addItems(points1);
            keeper.addItems(points2);
            keeper.addItems(points3);

            const slices = keeper.getAllSlices();

            expect(slices.length).toBe(5);
            expect(slices[0].rightBound).toBe(START_ISO);
            expect(slices[4].leftBound).toBe(points3[points3.length - 1].ts);

            expect(slices[1].leftBound).toBe(START_ISO);
            expect(slices[1].leftBoundInclude).toBeTruthy();
            expect(slices[1].rightBound).toBe(points1[points1.length - 1].ts);
            expect(slices[1].rightBoundInclude).toBeTruthy();
            expect(slices[1].items).toEqual(points1);

            expect(slices[2].leftBound).toBe(points1[points1.length - 1].ts);
            expect(slices[2].leftBoundInclude).toBeFalsy();
            expect(slices[2].rightBound).toBe(points2[points2.length - 1].ts);
            expect(slices[2].rightBoundInclude).toBeTruthy();
            expect(slices[2].items).toEqual(points2.slice(1));

            expect(slices[3].leftBound).toBe(points2[points2.length - 1].ts);
            expect(slices[3].leftBoundInclude).toBeFalsy();
            expect(slices[3].rightBound).toBe(points3[points3.length - 1].ts);
            expect(slices[3].rightBoundInclude).toBeTruthy();
            expect(slices[3].items).toEqual(points3.slice(1));
        });

        it('add few discharged slices', () => {
            const gap = 60_000 as Milliseconds;
            const points1 = generateItems(START, DURATION, 10);
            const points2 = generateItems(
                plus(iso2milliseconds(points1[points1.length - 1].ts), gap),
                DURATION,
                10,
            );
            const points3 = generateItems(
                plus(iso2milliseconds(points2[points2.length - 1].ts), gap),
                DURATION,
                10,
            );

            keeper.addItems(points1);
            keeper.addItems(points2);
            keeper.addItems(points3);

            expectSuccess();

            function expectSuccess() {
                const slices = keeper.getAllSlices();

                expect(slices.length).toBe(7);
                expect(slices[0].rightBound).toBe(START_ISO);
                expect(slices[6].leftBound).toBe(points3[points3.length - 1].ts);

                expect(slices[1].items).toEqual(points1);
                expect(slices[1].leftBound).toBe(START_ISO);
                expect(slices[1].rightBound).toBe(points1[points1.length - 1].ts);

                expect(slices[2].items).toBe(undefined);
                expect(slices[2].leftBound).toBe(points1[points1.length - 1].ts);
                expect(slices[2].rightBound).toBe(points2[0].ts);

                expect(slices[3].items).toEqual(points2);
                expect(slices[3].leftBound).toBe(points2[0].ts);
                expect(slices[3].rightBound).toBe(points2[points3.length - 1].ts);

                expect(slices[4].items).toBe(undefined);
                expect(slices[4].leftBound).toBe(points2[points1.length - 1].ts);
                expect(slices[4].rightBound).toBe(points3[0].ts);

                expect(slices[5].items).toEqual(points3);
                expect(slices[5].leftBound).toBe(points3[0].ts);
                expect(slices[5].rightBound).toBe(points3[points3.length - 1].ts);
            }
        });

        describe('add few intersecting slices', () => {
            const points = generateItems(START, DURATION, 20);
            const points1 = points.slice(0, 8);
            const points2 = points.slice(5, 15);
            const points3 = points.slice(12);

            it('order 1 2 3', () => {
                keeper.clear();
                keeper.addItems(points1);
                keeper.addItems(points2);
                keeper.addItems(points3);

                const slices = keeper.getAllSlices();

                expect(slices.length).toBe(5);
                expect(slices[0].rightBound).toBe(START_ISO);
                expect(slices[4].leftBound).toBe(points3[points3.length - 1].ts);

                expect(slices[1].leftBound).toBe(START_ISO);
                expect(slices[1].rightBound).toBe(points1[points1.length - 1].ts);
                expect(slices[1].items).toEqual(points1);

                expect(slices[2].leftBound).toBe(points1[points1.length - 1].ts);
                expect(slices[2].rightBound).toBe(points2[points2.length - 1].ts);
                expect(slices[2].items).toEqual(points2.slice(3));

                expect(slices[3].leftBound).toBe(points2[points2.length - 1].ts);
                expect(slices[3].rightBound).toBe(points3[points3.length - 1].ts);
                expect(slices[3].items).toEqual(points3.slice(3));
            });

            it('order 2 1 3', () => {
                keeper.clear();
                keeper.addItems(points2);
                keeper.addItems(points1);
                keeper.addItems(points3);

                const slices = keeper.getAllSlices();

                expect(slices.length).toBe(5);
                expect(slices[0].rightBound).toBe(START_ISO);
                expect(slices[4].leftBound).toBe(points3[points3.length - 1].ts);

                expect(slices[1].leftBound).toBe(START_ISO);
                expect(slices[1].rightBound).toBe(points2[0].ts);
                expect(slices[1].items).toEqual(points1.slice(0, 5));

                expect(slices[2].leftBound).toBe(points2[0].ts);
                expect(slices[2].rightBound).toBe(points2[points2.length - 1].ts);
                expect(slices[2].items).toEqual(points2);

                expect(slices[3].leftBound).toBe(points2[points2.length - 1].ts);
                expect(slices[3].rightBound).toBe(points3[points3.length - 1].ts);
                expect(slices[3].items).toEqual(points3.slice(3));
            });

            it('order 3 2 1', () => {
                keeper.clear();
                keeper.addItems(points3);
                keeper.addItems(points2);
                keeper.addItems(points1);

                const slices = keeper.getAllSlices();

                expect(slices.length).toBe(5);
                expect(slices[0].rightBound).toBe(START_ISO);
                expect(slices[4].leftBound).toBe(points3[points3.length - 1].ts);

                expect(slices[1].leftBound).toBe(START_ISO);
                expect(slices[1].rightBound).toBe(points2[0].ts);
                expect(slices[1].items).toEqual(points1.slice(0, 5));

                expect(slices[2].leftBound).toBe(points2[0].ts);
                expect(slices[2].rightBound).toBe(points3[0].ts);
                expect(slices[2].items).toEqual(points2.slice(0, 7));

                expect(slices[3].leftBound).toBe(points3[0].ts);
                expect(slices[3].rightBound).toBe(points3[points3.length - 1].ts);
                expect(slices[3].items).toEqual(points3);
            });
        });

        describe('extend existing slice', () => {
            it('without intersections', () => {
                const points = generateItems(START, DURATION, 20);
                const points1 = points.slice(0, 12);
                const points2 = points.slice(12, 15);
                const points3 = points.slice(15);

                keeper.addItems(points1, START_ISO, toISO(plus(START, DURATION)));
                keeper.addItems(points2);
                keeper.addItems(points3);

                const allSlices = keeper.getAllSlices();
                const allItems = keeper.getItems(20, START);

                expect(allSlices.length).toBe(7);
                expect(allItems).toEqual(points);

                expect(allSlices[1].leftBound).toBe(START_ISO);
                expect(allSlices[1].items).toEqual(points1);

                expect(allSlices[2].leftBound).toBe(points2[0].ts);
                expect(allSlices[2].rightBound).toBe(points2[points2.length - 1].ts);
                expect(allSlices[2].items).toBe(points2);

                expect(allSlices[4].leftBound).toBe(points3[0].ts);
                expect(allSlices[4].rightBound).toBe(points3[points3.length - 1].ts);
                expect(allSlices[4].items).toBe(points3);

                expect(allSlices[5].rightBound).toBe(toISO(plus(START, DURATION)));
            });

            it('with intersections', () => {
                const points = generateItems(START, DURATION, 20);
                const points1 = points.slice(0, 12);
                const points2 = points.slice(10, 15);
                const points3 = points.slice(12);

                keeper.addItems(points1, START_ISO, END_ISO);
                keeper.addItems(points2);
                keeper.addItems(points3);

                const allSlices = keeper.getAllSlices();
                const allItems = keeper.getItems(20, START);

                expect(allSlices.length).toBe(3);
                expect(allItems).toEqual(points);

                expect(allSlices[1].leftBound).toBe(START_ISO);
                expect(allSlices[1].rightBound).toBe(END_ISO);
                expect(allSlices[1].items).toEqual(points);
            });

            it('with same time', () => {
                const points = generateItems(START, 0 as Milliseconds, 4);
                const points1 = points.slice(0, 2);
                const points2 = points.slice(2);

                keeper.addItems([], START_ISO, START_ISO);
                keeper.addItems(points1);
                keeper.addItems(points2);

                const allSlices = keeper.getAllSlices();
                const allItems = keeper.getItems(20, START);

                expect(allSlices.length).toBe(3);
                expect(allItems).toEqual(points);

                expect(allSlices[1].leftBound).toBe(START_ISO);
                expect(allSlices[1].items).toEqual(points);
            });

            it('with same time with intersection', () => {
                const points = generateItems(START, 0 as Milliseconds, 8);
                const points1 = points.slice(0, 6);
                const points2 = points.slice(3);

                keeper.addItems([], START_ISO, START_ISO);
                keeper.addItems(points1);
                keeper.addItems(points2);

                const allSlices = keeper.getAllSlices();
                const allItems = keeper.getItems(20, START);

                expect(allSlices.length).toBe(3);
                expect(allItems).toEqual(points);

                expect(allSlices[1].leftBound).toBe(START_ISO);
                expect(allSlices[1].items).toEqual(points);
            });

            it('with same time at the end', () => {
                const points = generateItems(START, DURATION, 8).map((p, i, arr) => {
                    if (i < 4) return p;
                    return {
                        ...p,
                        ts: arr[3].ts,
                    };
                });

                const points1 = points.slice(0, 4);
                const points2 = points.slice(4);

                keeper.addItems(points1);
                keeper.addItems(points2);

                const allSlices = keeper.getAllSlices();
                const allItems = keeper.getItems(20, START);

                expect(allSlices.length).toBe(3);
                expect(allItems).toEqual(points);

                expect(allSlices[1].leftBound).toBe(START_ISO);
                expect(allSlices[1].items).toEqual(points);
            });

            it('with same time at the start', () => {
                const points = generateItems(START, DURATION, 8).map((p, i, arr) => {
                    if (i >= 4) {
                        return {
                            ...p,
                            ts: arr[i - 4].ts,
                        };
                    } else {
                        return {
                            ...p,
                            ts: arr[0].ts,
                        };
                    }
                });

                const points1 = points.slice(0, 4);
                const points2 = points.slice(4);

                keeper.addItems(points1);
                keeper.addItems(points2);

                const allSlices = keeper.getAllSlices();
                const allItems = keeper.getItems(20, START);

                expect(allSlices.length).toBe(4);
                expect(allItems).toEqual(points);

                expect(allSlices[1].items).toEqual(points1.concat(points2.slice(0, 1)));
                expect(allSlices[1].leftBound).toBe(START_ISO);
                expect(allSlices[1].leftBoundInclude).toBeTruthy();
                expect(allSlices[1].rightBoundInclude).toBeTruthy();

                expect(allSlices[2].items).toEqual(points2.slice(1));
                expect(allSlices[2].leftBound).toBe(START_ISO);
                expect(allSlices[2].leftBoundInclude).toBeFalsy();
            });
        });

        it('mark interval as empty', () => {
            const gap = 60_000 as Milliseconds;
            const points1 = generateItems(START, DURATION, 10);
            const points2 = generateItems(
                plus(iso2milliseconds(points1[points1.length - 1].ts), gap),
                DURATION,
                10,
            );
            const points3 = generateItems(
                plus(iso2milliseconds(points2[points2.length - 1].ts), gap),
                DURATION,
                10,
            );

            keeper.addItems(points1);
            keeper.addItems(points2);
            keeper.addItems(points3);
            // @ts-ignore
            keeper.markIntervalAsEmpty(points1[points1.length - 1].ts, points2[0].ts);
            // @ts-ignore
            keeper.markIntervalAsEmpty(
                sumDates(points2[points2.length - 1].ts, 20_000 as Milliseconds),
                sumDates(points3[0].ts, -20_000 as Milliseconds),
            );

            const slices = keeper.getSlices(
                Infinity,
                points1[0].ts,
                points3[points3.length - 1].ts,
            );

            expect(slices.length).toBe(7);
            expect(slices[1].items?.length).toBe(0);
            expect(slices[3].items).toBe(undefined);
            expect(slices[4].items?.length).toBe(0);
            expect(slices[5].items).toBe(undefined);
        });

        it('add one by one', () => {
            const points = generateItems(START, DURATION, 4);
            keeper.addItems([points[0]]);
            keeper.addItems([points[1]]);
            keeper.addItems([points[2]]);
            keeper.addItems([points[3]]);

            const slices = keeper.getAllSlices();
            const items = keeper.getItems(4, points[0].ts);
            const sameItems = keeper.getItems(-4, points[3].ts);

            expect(items).toEqual(sameItems);
            expect(slices.length).toBe(9);
            expect(items).toEqual(points);
        });
    });

    describe('read', () => {
        it('should read first and last item', function () {
            const points = generateItems(START, DURATION, 10);

            keeper.addItems(points);

            // first item
            {
                const slices = keeper.getSlices(1, points[0].ts);
                const items = keeper.getItems(1, points[0].ts);
                const sameSlices = keeper.getSlices(1, sumDates(points[0].ts, 1 as Milliseconds));
                const sameItems = keeper.extractItems(slices, points[0].ts, 1);

                expect(slices).toEqual(sameSlices);
                expect(slices.length).toBe(1);
                expect(slices[0].items).toEqual(points);

                expect(items).toEqual(sameItems);
                expect(items.length).toBe(1);
                expect(items[0]).toBe(points[0]);
            }

            // last item
            {
                const lastTs = points[points.length - 1].ts;
                const slices = keeper.getSlices(1, lastTs);
                const items = keeper.getItems(1, lastTs);
                const sameSlices = keeper.getSlices(1, sumDates(lastTs, -1 as Milliseconds));
                const sameItems = keeper.extractItems(slices, lastTs, 1);

                expect(slices).toEqual(sameSlices);
                expect(slices.length).toBe(1);
                expect(slices[0].items).toEqual(points);

                expect(items).toEqual(sameItems);
                expect(items.length).toBe(1);
                expect(items[0]).toBe(points[points.length - 1]);
            }
        });

        it('should read all items', function () {
            const points = generateItems(START, DURATION, 10);

            keeper.addItems(points);

            const items = keeper.getItems(10, points[0].ts);
            const sameItems = keeper.getItems(-10, points[points.length - 1].ts);

            expect(items).toEqual(sameItems);
            expect(items.length).toBe(10);
            expect(items).toEqual(points);
        });

        it('should read part of items', function () {
            const points = generateItems(START, DURATION, 10);

            keeper.addItems(points);

            const forwardStart = points[2].ts;
            const backwardStart = points[points.length - 3].ts;
            const items = keeper.getItems(6, forwardStart);
            const sameItems = keeper.getItems(-6, backwardStart);

            expect(items).toEqual(sameItems);
            expect(items.length).toBe(6);
            expect(items).toEqual(points.slice(2, 8));
        });

        it('should read more than exist', function () {
            const points = generateItems(START, DURATION, 10);
            keeper.addItems(points);

            {
                // forward read
                const slices = keeper.getSlices(11, points[0].ts);
                const sameSlices = keeper.getSlices(Infinity, points[0].ts);
                const items = keeper.getItems(11, points[0].ts);
                const sameItems = keeper.getItems(Infinity, points[0].ts);

                expect(slices).toEqual(sameSlices);
                expect(items).toEqual(sameItems);

                expect(slices.length).toBe(2);
                expect(slices[0].items?.length).toBe(10);
                expect(slices[1].items).toBe(undefined);

                expect(items.length).toBe(10);
            }

            {
                // backward read
                const slices = keeper.getSlices(-11, points[points.length - 1].ts);
                const sameSlices = keeper.getSlices(-Infinity, points[points.length - 1].ts);
                const items = keeper.getItems(-11, points[points.length - 1].ts);
                const sameItems = keeper.getItems(-Infinity, points[points.length - 1].ts);

                expect(slices).toEqual(sameSlices);
                expect(items).toEqual(sameItems);

                expect(slices.length).toBe(2);
                expect(slices[0].items).toBe(undefined);
                expect(slices[1].items?.length).toBe(10);

                expect(items.length).toBe(10);
            }
        });

        describe('read compacts written items', function () {
            function writeItemsCompacted() {
                const [points1, points2, points3] = generateCompactItems();

                keeper.addItems(points1);
                keeper.addItems(points2);
                keeper.addItems(points3);

                return [points1, points2, points3];
            }

            it('read segment between 2 slices', () => {
                const [points1, points2, points3] = writeItemsCompacted();

                // forward read
                {
                    const slices = keeper.getSlices(10, points1[5].ts);
                    const items = keeper.getItems(10, points1[5].ts);

                    expect(slices.length).toBe(2);
                    expect(slices[0].items).toEqual(points1.concat(points2.slice(0, 1)));
                    expect(slices[1].items).toEqual(points2.slice(1).concat(points3.slice(0, 1)));

                    expect(items.length).toBe(10);
                    expect(items).toEqual([...points1.slice(5), ...points2.slice(0, 5)]);
                }

                // backward read
                {
                    const slices = keeper.getSlices(-10, points2[5].ts);
                    const items = keeper.getItems(-10, points2[5].ts);

                    expect(slices.length).toBe(2);
                    expect(slices[0].items).toEqual(points1.concat(points2.slice(0, 1)));
                    expect(slices[1].items).toEqual(points2.slice(1).concat(points3.slice(0, 1)));

                    expect(items.length).toBe(10);
                    expect(items).toEqual([...points1.slice(6), ...points2.slice(0, 6)]);
                }
            });

            it('read segment between 3 slices', () => {
                const [points1, points2, points3] = writeItemsCompacted();

                const slices = keeper.getSlices(20, points1[5].ts);
                const items = keeper.getItems(20, points1[5].ts);

                expect(slices.length).toBe(3);
                expect(slices[0].items).toEqual(points1.concat(points2.slice(0, 1)));
                expect(slices[1].items).toEqual(points2.slice(1).concat(points3.slice(0, 1)));
                expect(slices[2].items).toEqual(points3.slice(1));
                expect(items.length).toBe(20);
                expect(items).toEqual([...points1.slice(5), ...points2, ...points3.slice(0, 5)]);
            });
        });

        describe('read discharged written items', function () {
            function writeItemsDischarged() {
                const gap = 60_000 as Milliseconds;
                const points1 = generateItems(START, DURATION, 10);
                const points2 = generateItems(
                    plus(iso2milliseconds(points1[points1.length - 1].ts), gap),
                    DURATION,
                    10,
                );
                const points3 = generateItems(
                    plus(iso2milliseconds(points2[points2.length - 1].ts), gap),
                    DURATION,
                    10,
                );

                keeper.addItems(points1);
                keeper.addItems(points2);
                keeper.addItems(points3);

                return [points1, points2, points3];
            }

            it('read intersection between 2 slices', () => {
                const [points1, points2] = writeItemsDischarged();

                // forward read
                {
                    const slices = keeper.getSlices(10, points1[5].ts);
                    const items = keeper.getItems(10, points1[5].ts);

                    expect(slices.length).toBe(3);
                    expect(slices[0].items).toEqual(points1);
                    expect(slices[1].isFilled()).toBeFalsy();
                    expect(slices[2].items).toEqual(points2);

                    expect(items.length).toBe(10);
                    expect(items).toEqual([...points1.slice(5), ...points2.slice(0, 5)]);
                }

                // backward read
                {
                    const slices = keeper.getSlices(-10, points2[5].ts);
                    const items = keeper.getItems(-10, points2[5].ts);

                    expect(slices.length).toBe(3);
                    expect(slices[0].items).toEqual(points1);
                    expect(slices[1].isFilled()).toBeFalsy();
                    expect(slices[2].items).toEqual(points2);

                    expect(items.length).toBe(10);
                    expect(items).toEqual([...points1.slice(6), ...points2.slice(0, 6)]);
                }
            });

            it('read intersection between 3 slices', () => {
                const [points1, points2, points3] = writeItemsDischarged();

                const slices = keeper.getSlices(20, points1[5].ts);
                const items = keeper.getItems(20, points1[5].ts);

                expect(slices.length).toBe(5);
                expect(slices[0].items).toEqual(points1);
                expect(slices[1].isFilled()).toBeFalsy();
                expect(slices[2].items).toEqual(points2);
                expect(slices[3].isFilled()).toBeFalsy();
                expect(slices[4].items).toEqual(points3);
                expect(items.length).toBe(20);
                expect(items).toEqual([...points1.slice(5), ...points2, ...points3.slice(0, 5)]);
            });
        });

        describe('items with same time', function () {
            it('single write', function () {
                const points = generateItems(START, 0 as Milliseconds, 10);
                keeper.addItems(points);

                const slicesSet = [
                    keeper.getSlices(10, points[0].ts),
                    keeper.getSlices(10, points[1].ts),
                    keeper.getSlices(-10, points[5].ts),
                    keeper.getSlices(-10, points[2].ts),
                ];

                for (let i = 1; i < slicesSet.length; i++) {
                    expect(slicesSet[i]).toEqual(slicesSet[i - 1]);
                }

                const itemsSet = [
                    keeper.getItems(10, points[0].ts),
                    keeper.getItems(10, points[1].ts),
                    keeper.getItems(-10, points[5].ts),
                    keeper.getItems(-10, points[2].ts),
                ];

                for (let i = 1; i < itemsSet.length; i++) {
                    expect(itemsSet[i]).toEqual(itemsSet[i - 1]);
                }
            });

            it('multiple full overlap write', function () {
                const points = generateItems(START, 0 as Milliseconds, 10);
                keeper.addItems(points);
                keeper.addItems(points.slice(5));
                keeper.addItems(points.slice(0, 5));

                const slicesSet = [
                    keeper.getSlices(10, points[0].ts),
                    keeper.getSlices(10, points[1].ts),
                    keeper.getSlices(-10, points[5].ts),
                    keeper.getSlices(-10, points[2].ts),
                ];

                for (let i = 1; i < slicesSet.length; i++) {
                    expect(slicesSet[i]).toEqual(slicesSet[i - 1]);
                }

                const itemsSet = [
                    keeper.getItems(10, points[0].ts),
                    keeper.getItems(10, points[1].ts),
                    keeper.getItems(-10, points[5].ts),
                    keeper.getItems(-10, points[2].ts),
                ];

                for (let i = 1; i < itemsSet.length; i++) {
                    expect(itemsSet[i]).toEqual(itemsSet[i - 1]);
                }
            });

            describe('multiple partial overlap write', function () {
                it('order 1', function () {
                    const points = generateItems(START, 0 as Milliseconds, 10);

                    keeper.addItems(points.slice(0, 8));
                    keeper.addItems(points.slice(5));

                    const slicesSet = [
                        keeper.getSlices(10, points[0].ts),
                        keeper.getSlices(10, points[1].ts),
                        keeper.getSlices(-10, points[5].ts),
                        keeper.getSlices(-10, points[2].ts),
                    ];
                    for (let i = 1; i < slicesSet.length; i++) {
                        expect(slicesSet[i]).toEqual(slicesSet[i - 1]);
                    }

                    const itemsSet = [
                        keeper.getItems(10, points[0].ts),
                        keeper.getItems(10, points[1].ts),
                        keeper.getItems(-10, points[5].ts),
                        keeper.getItems(-10, points[2].ts),
                    ];

                    for (let i = 1; i < itemsSet.length; i++) {
                        expect(itemsSet[i]).toEqual(itemsSet[i - 1]);
                    }
                });

                it('order 2', function () {
                    const points = generateItems(START, 0 as Milliseconds, 10);

                    keeper.addItems(points.slice(5));
                    keeper.addItems(points.slice(0, 8));

                    const slicesSet = [
                        keeper.getSlices(10, points[0].ts),
                        keeper.getSlices(10, points[1].ts),
                        keeper.getSlices(-10, points[5].ts),
                        keeper.getSlices(-10, points[2].ts),
                    ];

                    for (let i = 1; i < slicesSet.length; i++) {
                        expect(slicesSet[i]).toEqual(slicesSet[i - 1]);
                    }

                    const itemsSet = [
                        keeper.getItems(10, points[0].ts),
                        keeper.getItems(10, points[1].ts),
                        keeper.getItems(-10, points[5].ts),
                        keeper.getItems(-10, points[2].ts),
                    ];

                    for (let i = 1; i < itemsSet.length; i++) {
                        expect(itemsSet[i]).toEqual(itemsSet[i - 1]);
                    }
                });
            });

            it('should read correct interval with different bounds', function () {
                const points = generateItems(START, DURATION, 10);
                keeper.addItems(points);

                const start1 = new NanoDate(points[0].ts);
                start1.setMilliseconds(start1.getMilliseconds() + 1);
                const startIso1 = start1.toISOString();

                const start2 = new NanoDate(points[0].ts);
                start2.setMilliseconds(start2.getMilliseconds() + 10);
                const startIso2 = start2.toISOString();

                const start3 = new NanoDate(points[1].ts);
                start3.setMilliseconds(start3.getMilliseconds() - 10);
                const startIso3 = start3.toISOString();

                const start4 = new NanoDate(points[1].ts);
                start4.setMilliseconds(start4.getMilliseconds() - 1);
                const startIso4 = start4.toISOString();

                const items1 = keeper.getItems(3, startIso1);
                const items2 = keeper.getItems(3, startIso2);
                const items3 = keeper.getItems(3, startIso3);
                const items4 = keeper.getItems(3, startIso4);

                expect(items1).toEqual(items2);
                expect(items1).toEqual(items3);
                expect(items1).toEqual(items4);
            });
        });
    });

    it('squash', () => {
        const points = generateItems(START, DURATION, 4);
        keeper.addItems([points[0]]);
        keeper.addItems([points[1]]);
        keeper.addItems([points[2]]);
        keeper.addItems([points[3]]);

        const forSquash = keeper.getSlices(4, points[0].ts);
        const squashed = keeper.squashSlices(forSquash);

        const slices = keeper.getAllSlices();
        const items = keeper.getItems(4, points[0].ts);
        const sameItems = keeper.getItems(-4, points[3].ts);

        expect(slices.length).toBe(3);
        expect(squashed.items).toEqual(points);
        expect(items).toEqual(points);
        expect(items).toEqual(sameItems);
    });
});
