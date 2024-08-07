import type { Milliseconds, Someseconds } from '@common/types';
import { getRandomFloat64, getRandomIntInclusive } from '@common/utils';
import type { TraceId } from '@common/utils';
import { loggerCharter } from '@frontend/common/src/utils/Tracing/Children/Charter';

import { VALUES_PER_PIXEL } from '../../TextureStore';
import type {
    TPart,
    TPartInterval,
    TPartPointBuffer,
    TPartUnresolved,
    TPointAbsValue,
    TPointColor,
    TPointValue,
    TSeriesId,
} from '../def';
import { POINT_ITEM_SIZE } from '../def';
import { createPart as createNewPart, createPartBuffer, splitItemsDataForParts } from './part';
import {
    createPartAbsPoint,
    getLastAbsPointTime,
    getPointColor,
    getPointTime,
    getPointValue,
    getPointWidth,
    setPoint,
    setPointValue,
} from './point';

const createArray = (len: number, dur: number, baseValue = 0): TPartPointBuffer => {
    return createPartBuffer(
        new Array(len).fill(1).map((v, i) => {
            // x
            if (i % POINT_ITEM_SIZE === 0) {
                return Math.round((dur * i) / len);
            }
            // y
            if (i % POINT_ITEM_SIZE === 1) {
                return getRandomFloat64() - baseValue;
            }
            // color
            if (i % POINT_ITEM_SIZE === 2) {
                return getRandomFloat64();
            }
            // width
            return getRandomIntInclusive(1, 10);
        }),
    );
};
const createPart = ({
    size,
    interval,
    unresolved,
    baseValue = 0,
}: {
    size: number;
    interval: [number, number];
    unresolved?: TPartUnresolved;
    baseValue?: number;
}) =>
    createNewPart<TPart>({
        seriesId: '1' as TSeriesId,
        interval: interval as TPartInterval,
        pixelSize: 1 as Someseconds,
        size,
        baseValue,
        buffer: createArray(size * POINT_ITEM_SIZE, interval[1] - interval[0], baseValue),
        unresolved: unresolved ?? false,
    });

const mapTime =
    <T>(mapper: (v: T, i: number) => void) =>
    (v: T, i: number) =>
        i % POINT_ITEM_SIZE === 0 ? mapper(v, i) : v;

const MAX_PART_SIZE = 256;
const MAX_BUFFER_LENGTH = 256 * VALUES_PER_PIXEL;

describe('Part utils: splitExtendedDataForParts', () => {
    const defaultKeys = ['log', 'warn', 'error'] as (keyof Console)[];
    const originalConsole = { ...console } as Console;

    beforeEach(() => {
        defaultKeys.forEach((key) => (console[key] = jest.fn()));
    });

    afterEach(() => {
        defaultKeys.forEach((key) => (console[key] = originalConsole[key] as jest.Mock));
    });

    it('Should extend part', () => {
        const part = createPart({
            size: 10,
            interval: [0, 1e6],
        });
        const ts = getLastAbsPointTime(part)!;
        const extender = createPart({
            size: 10,
            interval: [ts, 1e6],
        });

        const { forPrevPart, forNextPart } = splitItemsDataForParts(
            part,
            extender,
            MAX_BUFFER_LENGTH,
        );

        expect(forPrevPart).toBeDefined();
        expect(forNextPart).toBeFalsy();
        expect(forPrevPart.buffer.length / POINT_ITEM_SIZE).toBe(extender.size);
        expect(forPrevPart.interval).toEqual(part.interval);
        expect(forPrevPart.baseValue).toBe(extender.baseValue);
        expect(forPrevPart.buffer).toEqual(extender.buffer.map(mapTime((v) => v + ts)));
    });

    it('Should change unresolved', () => {
        const part = createPart({
            size: 10,
            interval: [0, 1e6],
            unresolved: 'failed',
        });
        const ts = getLastAbsPointTime(part)!;
        const extender = createPart({
            size: 10,
            interval: [ts, 1e6],
            unresolved: false,
        });

        const { forPrevPart } = splitItemsDataForParts(part, extender, MAX_BUFFER_LENGTH);

        expect(forPrevPart.unresolved).toBe(false);
    });

    it('Should extend interval', () => {
        {
            const part = createPart({
                size: 2,
                interval: [0, 1e3],
                unresolved: false,
            });
            const extender = createPart({
                size: 2,
                interval: [1e3, 1e6],
                unresolved: false,
            });

            const { forPrevPart } = splitItemsDataForParts(part, extender, MAX_BUFFER_LENGTH);

            expect(forPrevPart.interval).toEqual([0, 1e6]);
        }

        {
            const part = createPart({
                size: 2,
                interval: [0, 1e3],
                unresolved: false,
            });
            const extender = createPart({
                size: 2,
                interval: [1e4, 1e6],
                unresolved: false,
            });

            const { forPrevPart } = splitItemsDataForParts(part, extender, MAX_BUFFER_LENGTH);

            expect(forPrevPart.interval).toEqual([0, 1e6]);
        }
    });

    it('Should throw error on incorrect intervals', () => {
        const part = createPart({
            size: 2,
            interval: [1e2, 1e3],
            unresolved: false,
        });
        const extender = createPart({
            size: 2,
            interval: [0, 1e6],
            unresolved: false,
        });

        loggerCharter.error = jest.fn();

        splitItemsDataForParts(part, extender, MAX_BUFFER_LENGTH);

        expect(loggerCharter.error).toBeCalled();
    });

    it('Should create new part', () => {
        const notEnough = 13;
        const part = createPart({
            size: MAX_PART_SIZE - notEnough,
            interval: [0, 1e3],
            unresolved: false,
        });
        const extender = createPart({
            size: 33,
            interval: [1e3, 1e6],
            unresolved: false,
        });

        const { forPrevPart, forNextPart } = splitItemsDataForParts(
            part,
            extender,
            MAX_BUFFER_LENGTH,
        );

        expect(forPrevPart).toBeDefined();
        expect(forNextPart).toBeDefined();

        const toPrevPart = notEnough * POINT_ITEM_SIZE;
        expect(forPrevPart.buffer.length).toBe(toPrevPart);
        const toNextPart = extender.size * POINT_ITEM_SIZE - toPrevPart;
        expect(forNextPart!.buffer.length).toBe(toNextPart);
        expect(forNextPart!.buffer).toEqual(
            extender.buffer
                .slice(toPrevPart)
                .map(mapTime((v) => v + extender.interval[0] - forNextPart!.interval[0])),
        );
    });

    describe('Overlap data tests', () => {
        it(`Shouldn't create new part after removing duplicate first point`, () => {
            const part = createPart({
                size: MAX_PART_SIZE,
                interval: [0, 1e3],
                unresolved: false,
            });
            const extender = createPart({
                size: 0,
                interval: [1e3, 1e6],
                unresolved: false,
            });
            extender.size += 1;
            extender.buffer.splice(
                0,
                0,
                getPointTime(part.buffer, part.size - 1) + part.interval[0] - extender.interval[0],
                getPointValue(part.buffer, part.size - 1) + part.baseValue - extender.baseValue,
                getPointColor(part.buffer, part.size - 1),
                getPointWidth(part.buffer, part.size - 1),
            );
            const { forPrevPart, forNextPart } = splitItemsDataForParts(
                part,
                extender,
                MAX_BUFFER_LENGTH,
            );

            expect(forPrevPart.size).toBe(0);
            expect(forNextPart).toBeFalsy();
        });

        it(`Shouldn't create new part after removing included data`, () => {
            const notEnough = 4;
            const part = createPart({
                size: MAX_PART_SIZE - notEnough,
                interval: [0, 1e3],
                unresolved: false,
            });
            const extender = createPart({
                size: 0,
                interval: [1e2, 1e6],
                unresolved: false,
            });
            extender.size += 2;
            extender.buffer.splice(
                0,
                0,

                getPointTime(part.buffer, part.size - 3) + part.interval[0] - extender.interval[0],
                getPointValue(part.buffer, part.size - 3) + part.baseValue - extender.baseValue,
                getPointColor(part.buffer, part.size - 3),
                getPointWidth(part.buffer, part.size - 3),

                getPointTime(part.buffer, part.size - 2) + part.interval[0] - extender.interval[0],
                getPointValue(part.buffer, part.size - 2) + part.baseValue - extender.baseValue,
                getPointColor(part.buffer, part.size - 2),
                getPointWidth(part.buffer, part.size - 2),
            );

            const { forPrevPart, forNextPart } = splitItemsDataForParts(
                part,
                extender,
                MAX_BUFFER_LENGTH,
            );

            expect(forPrevPart.size).toBe(0);
            expect(forNextPart).toBeFalsy();
        });

        it('Should create new part after removing duplicate several first points', () => {
            const notEnough = 4;
            const part = createPart({
                size: MAX_PART_SIZE - notEnough,
                interval: [0, 1e3],
                baseValue: 10,
                unresolved: false,
            });
            setPointValue(part.buffer, part.size - 2, NaN as unknown as TPointValue);

            const extender = createPart({
                size: 10,
                interval: [1e3, 1e6],
                baseValue: 100,
                unresolved: false,
            });
            const originalExtenderItems = extender.buffer.slice(0);

            extender.size += 3;
            extender.buffer.splice(
                0,
                0,
                // ---
                getPointTime(part.buffer, part.size - 3) + part.interval[0] - extender.interval[0],
                getPointValue(part.buffer, part.size - 3) + part.baseValue - extender.baseValue,
                getPointColor(part.buffer, part.size - 3),
                getPointWidth(part.buffer, part.size - 3),
                // ---
                getPointTime(part.buffer, part.size - 2) + part.interval[0] - extender.interval[0],
                getPointValue(part.buffer, part.size - 2) + part.baseValue - extender.baseValue, // <- custom NaN value
                getPointColor(part.buffer, part.size - 2),
                getPointWidth(part.buffer, part.size - 2),
                // ---
                getPointTime(part.buffer, part.size - 1) + part.interval[0] - extender.interval[0],
                getPointValue(part.buffer, part.size - 1) + part.baseValue - extender.baseValue,
                getPointColor(part.buffer, part.size - 1),
                getPointWidth(part.buffer, part.size - 1),
            );

            const { forPrevPart, forNextPart } = splitItemsDataForParts(
                part,
                extender,
                MAX_BUFFER_LENGTH,
            );

            expect(forPrevPart.size).toBe(notEnough);
            expect(forNextPart!.size).toBe(extender.size - notEnough - 3);

            expect(forNextPart!.buffer).toEqual(
                originalExtenderItems
                    .slice(-forNextPart!.buffer.length)
                    .map(mapTime((v) => v + extender.interval[0] - forNextPart!.interval[0])),
            );
        });

        it('Should create new part with removing duplicate several first points multi choose', () => {
            const notEnough = 3;
            const part = createPart({
                size: MAX_PART_SIZE - notEnough,
                interval: [0, 1e3],
                unresolved: false,
            });

            setPoint(
                part.buffer,
                part.size - 4,
                getPointTime(part.buffer, part.size - 3),
                getPointValue(part.buffer, part.size - 3),
                getPointColor(part.buffer, part.size - 3),
                getPointWidth(part.buffer, part.size - 3),
            );

            const extender = createPart({
                size: 8,
                interval: [1e3, 1e6],
                unresolved: false,
            });
            const originalExtenderItems = extender.buffer.slice();
            extender.size += 3;
            extender.buffer.splice(
                0,
                0,
                getPointTime(part.buffer, part.size - 3) + part.interval[0] - extender.interval[0],
                getPointValue(part.buffer, part.size - 3) + part.baseValue - extender.baseValue,
                getPointColor(part.buffer, part.size - 3),
                getPointWidth(part.buffer, part.size - 3),

                getPointTime(part.buffer, part.size - 2) + part.interval[0] - extender.interval[0],
                getPointValue(part.buffer, part.size - 2) + part.baseValue - extender.baseValue,
                getPointColor(part.buffer, part.size - 2),
                getPointWidth(part.buffer, part.size - 2),

                getPointTime(part.buffer, part.size - 1) + part.interval[0] - extender.interval[0],
                getPointValue(part.buffer, part.size - 1) + part.baseValue - extender.baseValue,
                getPointColor(part.buffer, part.size - 1),
                getPointWidth(part.buffer, part.size - 1),
            );

            const { forPrevPart, forNextPart } = splitItemsDataForParts(
                part,
                extender,
                MAX_BUFFER_LENGTH,
            );

            expect(forPrevPart.size).toBe(3);
            expect(forPrevPart.buffer.slice(-3 * POINT_ITEM_SIZE)).toEqual(
                originalExtenderItems
                    .slice(0, 3 * POINT_ITEM_SIZE)
                    .map(mapTime((v) => v + extender.interval[0] - part.interval[0])),
            );

            expect(forNextPart!.size).toBe(5);
            expect(forNextPart!.buffer).toEqual(
                originalExtenderItems
                    .slice(3 * POINT_ITEM_SIZE)
                    .map(mapTime((v) => v + extender.interval[0] - forNextPart!.interval[0])),
            );
        });

        it(`Check loops detection with different baseValue and different interval`, () => {
            const notEnough = 2;
            const part: TPart = {
                id: '8283219501239073704' as TraceId,
                size: 6,
                baseValue: 100,
                buffer: [
                    0, 0, 0, 0, 1, -1, 0, 0, 2, -2, 0, 0, 10, -10, 0, 0, 20, -20, 0, 0, 30, -30, 0,
                    0,
                ] as TPartPointBuffer,
                unresolved: 'live' as TPartUnresolved,
                absLeftPoint: createPartAbsPoint(
                    64842143940000000 as Someseconds,
                    22886 as TPointAbsValue,
                    0 as TPointColor,
                    0,
                ),
                tsUpdate: 1674301378318 as Milliseconds,
                seriesId: 'Label_1' as TSeriesId,
                pixelSize: 10000000 as Someseconds,
                interval: [10000, 10030] as TPartInterval,
            };

            const extender: TPart = {
                id: '8283219501239073704' as TraceId,
                size: 6,
                baseValue: 90,
                buffer: [
                    0, 0, 0, 0, 10, -10, 0, 0, 20, -20, 0, 0, 21, -21, 0, 0, 22, -22, 0, 0,
                ] as TPartPointBuffer,
                unresolved: 'live' as TPartUnresolved,
                absLeftPoint: createPartAbsPoint(
                    null as unknown as Someseconds,
                    null as unknown as TPointAbsValue,
                    0 as TPointColor,
                    0,
                ),
                tsUpdate: 1674301378318 as Milliseconds,
                seriesId: 'Label_1' as TSeriesId,
                pixelSize: 10000000 as Someseconds,
                interval: [10010, 10032] as TPartInterval,
            };

            const { forPrevPart, forNextPart } = splitItemsDataForParts(
                part,
                extender,
                MAX_BUFFER_LENGTH,
            );

            expect(forPrevPart.size).toBe(notEnough);
            expect(forNextPart).toBeUndefined();
            expect(forPrevPart.buffer).toEqual([31, -31, 0, 0, 32, -32, 0, 0]);
        });
    });
});
