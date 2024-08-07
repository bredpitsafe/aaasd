import { minus, plus } from '@common/utils';
import { assert } from '@common/utils/src/assert.ts';
import { isNumber } from 'lodash-es';

import type {
    TNormalizedPartInterval,
    TPart,
    TPartAbsPoint,
    TPartPoint,
    TPointAbsTime,
    TPointAbsValue,
    TPointColor,
    TPointTime,
    TPointValue,
    TPointWidth,
} from '../def';
import { POINT_ITEM_SIZE, TPartPointBuffer } from '../def';

function createPartPoint(
    timeDelta: TPointTime,
    value: TPointValue,
    color: TPointColor,
    width: TPointWidth,
    out?: undefined | TPartPoint | TPartAbsPoint,
): TPartPoint {
    out = out ?? createEmptyPartPoint();
    out.x = timeDelta;
    out.y = value;
    out.color = color;
    out.width = width;
    return out as TPartPoint;
}

export function createPartAbsPoint(
    time: TPointAbsTime,
    value: TPointAbsValue,
    color: TPointColor,
    width: TPointWidth,
    out?: undefined | TPartPoint | TPartAbsPoint,
): TPartAbsPoint {
    out = out ?? createEmptyPartAbsPoint();
    out.x = time;
    out.y = value;
    out.color = color;
    out.width = width;
    return out as TPartAbsPoint;
}

/**
 * @public
 */
export function createEmptyPartPoint(): TPartPoint {
    return {
        x: 0 as TPointTime,
        y: 0 as TPointValue,
        color: 0 as TPointColor,
        width: 0,
    };
}

/**
 * @public
 */
export function createEmptyPartAbsPoint(): TPartAbsPoint {
    return {
        x: 0 as TPointAbsTime,
        y: 0 as TPointAbsValue,
        color: 0 as TPointColor,
        width: 0,
    };
}

export function setPoint(
    buffer: TPartPointBuffer,
    index: number,
    time: TPointTime,
    value: TPointValue,
    color: TPointColor,
    width: TPointWidth,
): void {
    setPointTime(buffer, index, time);
    setPointValue(buffer, index, value);
    setPointColor(buffer, index, color);
    setPointWidth(buffer, index, width);
}

export function getPointTime(buffer: TPartPointBuffer, index: number): TPointTime {
    const value = buffer[index * POINT_ITEM_SIZE] as TPointTime;
    assert(value !== undefined, 'Incorrect point index in buffer');
    return value;
}

export function getPointValue(buffer: TPartPointBuffer, index: number): TPointValue {
    const value = buffer[index * POINT_ITEM_SIZE + 1] as TPointValue;
    assert(value !== undefined, 'Incorrect point index in buffer');
    return value;
}

export function getPointColor(buffer: TPartPointBuffer, index: number): TPointColor {
    const value = buffer[index * POINT_ITEM_SIZE + 2] as TPointColor;
    assert(value !== undefined, 'Incorrect point index in buffer');
    return value;
}

export function getPointWidth(buffer: TPartPointBuffer, index: number): TPointWidth {
    const value = buffer[index * POINT_ITEM_SIZE + 3] as TPointWidth;
    assert(value !== undefined, 'Incorrect point index in buffer');
    return value;
}

export function setPointTime(buffer: TPartPointBuffer, index: number, value: TPointTime): void {
    assert(index * POINT_ITEM_SIZE < buffer.length, 'Incorrect point index in buffer');
    buffer[index * POINT_ITEM_SIZE] = value;
}

export function setPointValue(buffer: TPartPointBuffer, index: number, value: TPointValue): void {
    assert(index * POINT_ITEM_SIZE < buffer.length, 'Incorrect point index in buffer');
    buffer[index * POINT_ITEM_SIZE + 1] = value;
}

/**
 * @public
 */
export function setPointColor(buffer: TPartPointBuffer, index: number, value: TPointColor): void {
    assert(index * POINT_ITEM_SIZE < buffer.length, 'Incorrect point index in buffer');
    buffer[index * POINT_ITEM_SIZE + 2] = value;
}

/**
 * @public
 */
export function setPointWidth(buffer: TPartPointBuffer, index: number, value: TPointWidth): void {
    assert(index * POINT_ITEM_SIZE < buffer.length, 'Incorrect point index in buffer');
    buffer[index * POINT_ITEM_SIZE + 3] = value;
}

export function fromAbsPoint(
    part: Pick<TPart, 'interval' | 'baseValue'>,
    point: undefined | TPartAbsPoint,
    out?: undefined | TPartPoint | TPartAbsPoint,
): undefined | TPartPoint {
    return point === undefined
        ? undefined
        : createPartPoint(
              minus(point.x, part.interval[0]),
              minus(point.y, part.baseValue),
              point.color,
              point.width,
              out,
          );
}

type TToAbsPoint = {
    (
        part: Pick<TPart, 'interval' | 'baseValue'>,
        point: undefined,
        out?: undefined | TPartPoint,
    ): undefined;
    (
        part: Pick<TPart, 'interval' | 'baseValue'>,
        point: TPartPoint,
        out?: undefined | TPartPoint,
    ): TPartAbsPoint;
    (
        part: Pick<TPart, 'interval' | 'baseValue'>,
        point: undefined | TPartPoint,
        out?: undefined | TPartPoint,
    ): undefined | TPartAbsPoint;
};
export const toAbsPoint: TToAbsPoint = (
    part: Pick<TPart, 'interval' | 'baseValue'>,
    point: undefined | TPartPoint,
    out?: undefined | TPartPoint,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
): any => {
    return point === undefined
        ? undefined
        : createPartAbsPoint(
              plus(point.x, part.interval[0]),
              plus(point.y, part.baseValue),
              point.color,
              point.width,
              out,
          );
};

export function toAbsPointValue(
    part: Pick<TPart, 'baseValue'>,
    value: undefined | TPointValue,
): undefined | TPointAbsValue {
    return isNumber(value) ? ((value + part.baseValue) as TPointAbsValue) : undefined;
}

/**
 * @public
 */
export function toAbsPointTime(
    part: Pick<TPart, 'interval'>,
    time: undefined | TPointAbsTime,
): undefined | number {
    return isNumber(time) ? plus(time, part.interval[0]) : undefined;
}

export function getPoint(
    part: Pick<TPart, 'size' | 'buffer'>,
    index: number,
    out?: undefined | TPartPoint,
): undefined | TPartPoint {
    index = index >= 0 ? index : part.size + index;

    return index > part.size || part.size === 0
        ? undefined
        : createPartPoint(
              getPointTime(part.buffer, index)!,
              getPointValue(part.buffer, index)!,
              getPointColor(part.buffer, index)!,
              getPointWidth(part.buffer, index)!,
              out,
          );
}

/**
 * @public
 */
export function getLastPoint(
    part: Pick<TPart, 'size' | 'buffer' | 'interval'>,
): undefined | TPartPoint {
    return getPoint(part, part.size - 1);
}

export function getLastAbsPoint(
    part: Pick<TPart, 'size' | 'buffer' | 'interval' | 'baseValue'>,
): undefined | TPartAbsPoint {
    return getAbsPoint(part, part.size - 1);
}

/**
 * @public
 */
export function getFirstPoint(
    part: Pick<TPart, 'size' | 'buffer' | 'interval'>,
): undefined | TPartPoint {
    return getPoint(part, 0);
}

export function getFirstPointTime(part: Pick<TPart, 'size' | 'buffer'>): undefined | TPointTime {
    return part.size === 0 ? undefined : getPointTime(part.buffer, 0);
}

export function getLastPointTime(part: Pick<TPart, 'size' | 'buffer'>): undefined | TPointTime {
    return part.size === 0 ? undefined : getPointTime(part.buffer, part.size - 1);
}

export function getFirstAbsPoint(
    part: Pick<TPart, 'size' | 'buffer' | 'interval' | 'baseValue'>,
): undefined | TPartAbsPoint {
    return getAbsPoint(part, 0);
}

export function getFirstAbsPointTime(
    part: Pick<TPart, 'size' | 'buffer' | 'interval'>,
): undefined | TPointAbsTime {
    return part.size === 0 ? undefined : getAbsPointTime(part, 0);
}

export function getLastAbsPointTime(
    part: Pick<TPart, 'size' | 'buffer' | 'interval'>,
): undefined | TPointAbsTime {
    return part.size === 0 ? undefined : getAbsPointTime(part, part.size - 1);
}

export function getAbsPointTime(
    part: Pick<TPart, 'size' | 'buffer' | 'interval'>,
    index: number,
): TPointAbsTime {
    return plus(part.interval[0], getPointTime(part.buffer, index));
}

/**
 * @public
 */
export function getFirstAbsPointValue(
    part: Pick<TPart, 'size' | 'buffer' | 'baseValue'>,
): undefined | number {
    return getAbsPointValue(part, 0);
}

/**
 * @public
 */
export function getLastAbsPointValue(
    part: Pick<TPart, 'size' | 'buffer' | 'baseValue'>,
): undefined | number {
    return getAbsPointValue(part, part.size - 1);
}

export function getAbsPointValue(
    part: Pick<TPart, 'size' | 'buffer' | 'baseValue'>,
    index: number,
): undefined | number {
    const value = getPointValue(part.buffer, index);
    return value === undefined ? undefined : toAbsPointValue(part, value);
}

export function getAbsPoint(
    part: Pick<TPart, 'size' | 'buffer' | 'interval' | 'baseValue'>,
    index: number,
): undefined | TPartAbsPoint {
    const point = getPoint(part, index);
    return toAbsPoint(part, point, point);
}

export function getMinTimeStart(parts: Pick<TPart, 'interval'>[]): TPointAbsTime {
    return parts.reduce(
        (acc: TPointAbsTime, part) => (acc <= part.interval[0] ? acc : part.interval[0]),
        Infinity as TPointAbsTime,
    );
}

export function getMaxTimeEnd(parts: Pick<TPart, 'interval'>[]): TPointAbsTime {
    return parts.reduce(
        (acc, part) => (acc >= part.interval[1] ? acc : part.interval[1]),
        -Infinity as TPointAbsTime,
    );
}

/**
 * @public
 */
export function getMinBaseValue(parts: Pick<TPart, 'baseValue'>[]): number {
    return parts.reduce((acc, part) => (acc <= part.baseValue ? acc : part.baseValue), Infinity);
}

export function sortPartsByFirstPoint<T extends Pick<TPart, 'size' | 'buffer' | 'interval'>>(
    parts: T[],
): T[] {
    return [...parts].sort((a, b) => {
        return (
            (getFirstAbsPointTime(a) || a.interval[0]) - (getFirstAbsPointTime(b) || b.interval[0])
        );
    });
}

export function sortPartsByLastPoint<T extends Pick<TPart, 'size' | 'buffer' | 'interval'>>(
    parts: T[],
): T[] {
    return [...parts].sort((a, b) => {
        return (
            (getLastAbsPointTime(a) || a.interval[0]) - (getLastAbsPointTime(b) || b.interval[0])
        );
    });
}

function onEachMissedIntervalBetweenParts(
    parts: Pick<TPart, 'size' | 'buffer' | 'interval'>[],
    callback: (interval: TNormalizedPartInterval) => boolean, // prevent?
): void {
    const sorted = sortPartsByFirstPoint(parts);

    let timeStart = sorted[0].interval[0];
    let timeEnd = sorted[0].interval[1];

    for (let i = 1; i < sorted.length; i++) {
        if (timeStart === sorted[i].interval[0] && timeEnd < sorted[i].interval[1]) {
            timeEnd = sorted[i].interval[1];
        }

        if (timeStart < sorted[i].interval[0]) {
            if (timeEnd < sorted[i].interval[0]) {
                if (callback(<TNormalizedPartInterval>[timeEnd, sorted[i].interval[0]])) {
                    return;
                }
            }

            timeStart = sorted[i].interval[0];
            timeEnd = Math.max(timeEnd, sorted[i].interval[1]) as TPointAbsTime;
        }
    }
}

export function getMissedIntervalsBetweenParts(
    parts: Pick<TPart, 'size' | 'buffer' | 'interval'>[],
): TNormalizedPartInterval[] {
    const missedIntervals: TNormalizedPartInterval[] = [];

    onEachMissedIntervalBetweenParts(parts, (int) => {
        missedIntervals.push(int);
        return false;
    });

    return missedIntervals;
}
