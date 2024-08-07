import { generateTraceId, getNowMilliseconds, minus, plus } from '@common/utils';
import { assert } from '@common/utils/src/assert.ts';
import { EMPTY_ARRAY } from '@frontend/common/src/utils/const';
import { findLeftClosestIndex } from '@frontend/common/src/utils/findClosest';
import { loggerCharter } from '@frontend/common/src/utils/Tracing/Children/Charter';

import type {
    TPart,
    TPartInterval,
    TPartItemsData,
    TPartPointBuffer,
    TPointTime,
    TPointValue,
} from '../def';
import { POINT_ITEM_SIZE, TPartAbsPoint } from '../def';
import {
    getAbsPoint,
    getAbsPointTime,
    getAbsPointValue,
    getFirstAbsPointTime,
    getLastAbsPointTime,
    getPointTime,
    getPointValue,
    setPointTime,
    setPointValue,
} from './point';

export function createPart<T extends TPart>(
    part: Pick<T, 'seriesId' | 'interval' | 'pixelSize'> &
        Partial<Pick<T, 'tsUpdate'>> &
        Partial<Pick<T, 'id' | 'size' | 'buffer' | 'baseValue' | 'unresolved'>>,
): T {
    return {
        id: generateTraceId(),

        size: 0,
        baseValue: 0,
        buffer: part.buffer || createPartBuffer(),

        unresolved: false,

        absLeftPoint: undefined,
        absRightPoint: undefined,

        tsUpdate: getNowMilliseconds(),

        ...part,
    } as T;
}

export function createPartBuffer(source?: number[]): TPartPointBuffer {
    return (source ?? EMPTY_ARRAY).slice() as TPartPointBuffer;
}

function validateExtendedDataForPart(part: TPart, data: TPartItemsData) {
    if (part.interval[0] > data.interval[0]) {
        loggerCharter.error('Data can`t start before part');
    }

    const lastTimeInCurrentPart = getLastAbsPointTime(part) ?? NaN;
    const firstTimeInData = getFirstAbsPointTime(data) ?? NaN;

    if (
        !isNaN(lastTimeInCurrentPart) &&
        !isNaN(firstTimeInData) &&
        lastTimeInCurrentPart > firstTimeInData
    ) {
        loggerCharter.error(
            `Start of received data ${firstTimeInData} is before the end of current part ${lastTimeInCurrentPart}, with diff ${
                lastTimeInCurrentPart - firstTimeInData
            }.`,
        );
    }
}

export function splitItemsDataForParts(
    part: TPart,
    data: TPartItemsData,
    maxBufferLength: number,
): {
    forPrevPart: TPartItemsData;
    forNextPart: undefined | TPartItemsData;
} {
    validateExtendedDataForPart(part, data);

    const dataOffset = getDataRepeatingPointsOffset(part, data) * POINT_ITEM_SIZE;
    const dataBuffer = dataOffset > 0 ? data.buffer.slice(dataOffset) : data.buffer;
    const dataLength = data.size * POINT_ITEM_SIZE - dataOffset;
    const partLength = part.size * POINT_ITEM_SIZE;
    const splitLength = Math.min(maxBufferLength - partLength, dataLength);
    const splitSize = splitLength / POINT_ITEM_SIZE;

    const timeEnd = Math.max(data.interval[1], part.interval[1]);
    const timeEdge = splitLength === dataLength ? timeEnd : getAbsPointTime(data, splitSize)!;

    const nextDeltaTime = data.interval[0] - timeEdge;
    const nextBuffer = dataBuffer.slice(splitLength) as TPartPointBuffer;
    const nextSize = nextBuffer.length / POINT_ITEM_SIZE;

    for (let i = 0; i < nextSize; i++) {
        setPointTime(nextBuffer, i, plus(getPointTime(nextBuffer, i)!, nextDeltaTime));
    }

    const forNextPart =
        nextBuffer.length === 0
            ? undefined
            : {
                  buffer: nextBuffer,
                  size: nextSize,
                  interval: [timeEdge, timeEnd] as TPartInterval,
                  baseValue: data.baseValue,
                  unresolved: data.unresolved,
              };

    const baseValue = canChangeBaseValue(part) ? data.baseValue : part.baseValue;
    const deltaValue = data.baseValue - baseValue;
    const prevDeltaTime = data.interval[0] - part.interval[0];
    const prevBuffer = dataBuffer.slice(0, splitLength) as TPartPointBuffer;
    const prevSize = prevBuffer.length / POINT_ITEM_SIZE;

    for (let i = 0; i < prevSize; i++) {
        setPointTime(prevBuffer, i, plus(getPointTime(prevBuffer, i)!, prevDeltaTime));
        setPointValue(prevBuffer, i, plus(getPointValue(prevBuffer, i)!, deltaValue));
    }

    const forPrevPart = {
        buffer: prevBuffer,
        size: prevSize,
        interval: [part.interval[0], timeEdge] as TPartInterval,
        baseValue,
        unresolved: forNextPart ? false : data.unresolved,
    };

    return { forPrevPart, forNextPart };
}

function getDataRepeatingPointsOffset(currentPart: TPart, incomingData: TPartItemsData): number {
    if (currentPart.size === 0 || incomingData.size === 0) {
        return 0;
    }

    const firstAbsPoint = getAbsPoint(incomingData, 0);

    assert(firstAbsPoint !== undefined, 'Point can not be is undefined');

    const pointsIndexes = findLeftPointsIndexes(currentPart, firstAbsPoint);

    for (const pointIndex of pointsIndexes) {
        if (partEndsWithIncomingData(currentPart, incomingData, pointIndex)) {
            return Math.min(currentPart.size - pointIndex, incomingData.size);
        }
    }

    return 0;
}

function partEndsWithIncomingData(part: TPart, data: TPartItemsData, point: number): boolean {
    for (
        let index = point, dataIndex = 0;
        index < part.size && dataIndex < data.size;
        index++, dataIndex++
    ) {
        const partTime = getAbsPointTime(part, index);
        const dataTime = getAbsPointTime(data, dataIndex);

        if (partTime !== dataTime) {
            return false;
        }

        const partValue = getAbsPointValue(part, index);
        const dataValue = getAbsPointValue(data, dataIndex);

        assert(partValue !== undefined, 'Value can not be is undefined');
        assert(dataValue !== undefined, 'Value can not be is undefined');

        if ((!isNaN(partValue) || !isNaN(dataValue)) && partValue !== dataValue) {
            return false;
        }
    }

    return true;
}

function findLeftPointsIndexes(part: TPart, point: TPartAbsPoint): number[] {
    const time: TPointTime = minus(point.x, part.interval[0]);
    const value: TPointValue = minus(point.y, part.baseValue);

    let foundTimePointIndex = findLeftClosestIndex(time, part.buffer, POINT_ITEM_SIZE);

    if (foundTimePointIndex < 0) {
        return [];
    }

    const isValueNaN = isNaN(value);
    const partTime = getPointTime(part.buffer, foundTimePointIndex);
    const matchPoints = [];

    do {
        const itemValue = getPointValue(part.buffer, foundTimePointIndex);

        assert(itemValue !== undefined, 'itemValue can not be is undefined');

        if (value === itemValue || (isValueNaN && isNaN(itemValue))) {
            matchPoints.push(foundTimePointIndex);
        }

        foundTimePointIndex++;
    } while (
        foundTimePointIndex < part.size &&
        part.buffer[foundTimePointIndex * POINT_ITEM_SIZE] === partTime
    );

    return matchPoints;
}

function canChangeBaseValue(part: TPart): boolean {
    if (part.baseValue !== 0) return false;

    for (let i = 0; i < part.size; i++) {
        if (!isNaN(getPointValue(part.buffer, i)!)) return false;
    }

    return true;
}
