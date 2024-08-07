import {
    areEqualWithTolerance,
    getEdgeNumberPosition,
    getMeaningDifference,
    getRealExponent,
    minus,
} from '@common/utils';
import {
    decreaseIndexWhileBigger,
    decreaseIndexWhileEqual,
    findLeftClosestIndex,
    findRightIndexByEqual,
    increaseIndexWhileEqual,
    increaseIndexWhileLower,
} from '@frontend/common/src/utils/findClosest';
import { isNil } from 'lodash-es';

import type { TPart, TPointAbsTime } from '../../../lib/Parts/def';
import { POINT_ITEM_SIZE } from '../../../lib/Parts/def';
import { getAbsPointValue } from '../../../lib/Parts/utils/point';
import { EChartType } from '../../components/Chart/defs';
import { EVirtualViewport } from '../../components/ChartViewport/defs';
import type { TMinMax, TPartialMinMax, TViewportData } from './defs';

// order is important for case when v == NaN
export const getMin = (min: number, v: number): number => (v < min ? v : min);
export const getMax = (max: number, v: number): number => (v > max ? v : max);

export function getMinMaxPair(min: number | undefined, max: number | undefined): TPartialMinMax {
    const hasMin = hasFiniteNumberValue(min);
    const hasMax = hasFiniteNumberValue(max);

    const normalizedMin = hasMin && hasMax ? Math.min(min, max) : hasMin ? min : undefined;
    const normalizedMax = hasMin && hasMax ? Math.max(min, max) : hasMax ? max : undefined;

    return [normalizedMin, normalizedMax];
}

export function getNearestFromRange(
    value: number | undefined,
    min: number | undefined,
    max: number | undefined,
) {
    if (hasNumberValue(value)) {
        if (hasFiniteNumberValue(max) && value > max) {
            return max;
        }
        if (hasFiniteNumberValue(min) && value < min) {
            return min;
        }
    }

    return value;
}

function hasNumberValue(value: number | undefined): value is number {
    return !isNil(value) && !isNaN(value);
}
function hasFiniteNumberValue(value: number | undefined): value is number {
    return hasNumberValue(value) && isFinite(value);
}

export function minMaxWithOptimalDiff(source: TMinMax): TMinMax {
    if (isWideScaled(source)) {
        return source;
    }

    if (
        !areEqualWithTolerance(
            source[0],
            source[1],
            getMeaningDifference(source[0], Math.max(9, getEdgeNumberPosition(source[0]))),
        )
    ) {
        return source;
    }

    const expand = parseFloat(`1e${getRealExponent(source[0]) - 1}`);

    return [source[0] - expand, source[1] + expand];
}

export const keepValidMinMax = (prev: TMinMax, next: TMinMax): TMinMax => {
    return [isFinite(next[0]) ? next[0] : prev[0], isFinite(next[1]) ? next[1] : prev[1]];
};

const selectLeftVV = ({ yAxis }: TViewportData) => yAxis === EVirtualViewport.left;
export function getMostRelevantSide(data?: TViewportData[]): EVirtualViewport | undefined {
    if (isNil(data) || data.length === 0) {
        return undefined;
    }

    return data.some(selectLeftVV) ? EVirtualViewport.left : EVirtualViewport.right;
}

export function shouldConsiderLeftPoint(type: EChartType): boolean {
    return type === EChartType.lines || type === EChartType.stairs;
}

export function shouldConsiderRightPoint(type: EChartType): boolean {
    return type === EChartType.lines;
}

export function getClosestAbsLeftValue(parts: TPart[], time: TPointAbsTime): undefined | number {
    const partIndex = parts.findIndex(({ interval }) => time >= interval[0] && time <= interval[1]);

    if (partIndex >= 0) {
        const part = parts[partIndex];
        const edge = minus(time, part.interval[0]);
        const closestIndex = findLeftClosestIndex(edge, part.buffer, POINT_ITEM_SIZE);
        const rightestIndex = increaseIndexWhileEqual(closestIndex, part.buffer, POINT_ITEM_SIZE);
        const index = decreaseIndexWhileBigger(edge, rightestIndex, part.buffer, POINT_ITEM_SIZE);

        if (index !== -1) {
            return getAbsPointValue(part, index);
        }
    }

    return parts.find(selectPartWithLeftPoint(time))?.absLeftPoint?.y;
}

export function getClosestAbsRightValue(parts: TPart[], time: TPointAbsTime): undefined | number {
    const partIndex = parts.findIndex(({ interval }) => time >= interval[0] && time <= interval[1]);

    if (partIndex >= 0) {
        const part = parts[partIndex];
        const edge = minus(time, part.interval[0]);
        const closestIndex = findRightIndexByEqual(
            findLeftClosestIndex(edge, part.buffer, POINT_ITEM_SIZE),
            part.buffer,
            POINT_ITEM_SIZE,
        );
        const leftestIndex = decreaseIndexWhileEqual(closestIndex, part.buffer, POINT_ITEM_SIZE);
        const index = increaseIndexWhileLower(edge, leftestIndex, part.buffer, POINT_ITEM_SIZE);

        if (index !== -1) {
            return getAbsPointValue(part, index);
        }
    }

    return parts.find(selectPartWithRightPoint(time))?.absRightPoint?.y;
}

export function isWideScaled(minMax: TMinMax): boolean {
    return !isFinite(minMax[0]) || !isFinite(minMax[1]);
}

function selectPartWithLeftPoint(time: TPointAbsTime) {
    return (part: TPart) => !isNil(part.absLeftPoint) && part.absLeftPoint.x <= time;
}

function selectPartWithRightPoint(time: TPointAbsTime) {
    return (part: TPart) => !isNil(part.absRightPoint) && part.absRightPoint.x >= time;
}
