import { isFunction, isNil, isNumber, isString, isUndefined } from 'lodash-es';
import memoizee from 'memoizee';
import { identity } from 'rxjs';

import type { Nil } from '../../../types';
import type { Nanoseconds } from '../../../types/time';
import { assertNever } from '../../../utils/assert';
import { string2hex } from '../../../utils/colors';
import { sum } from '../../../utils/math';
import { hexToPackedRGBA, TPackedRGBA } from '../../../utils/packRGBA';
import { getNumberConversionSandbox } from '../../../utils/Sandboxes/numberConversion';
import { getPointStylerSandbox } from '../../../utils/Sandboxes/pointStyler';
import { getNowNanoseconds } from '../../../utils/time';
import {
    CHART_POINT_ITEM_SIZE,
    COORDS_ITEM_SIZE,
    EChartPointItemOffset,
    stylerUtils,
    TClosestChartPoint,
    TClosestPoint,
    TGetChartPointsProps,
    TGetChartPointsReturnType,
    TGetPointsCoordsReturnType,
    TIME_DELTA,
    TPointStyle,
    TPointStylerArgs,
} from './defs';

export function getChartPartPoints(
    pointCoords: TGetPointsCoordsReturnType,
    props: TGetChartPointsProps,
): TGetChartPointsReturnType {
    const items: number[] = Array.from({
        length: (pointCoords.items.length * CHART_POINT_ITEM_SIZE) / COORDS_ITEM_SIZE,
    });

    const getValue = getValueFactory(props.formula);
    const getStyle = getStylerFactory(props).bind(null, getNowNanoseconds());
    const modifiedBaseValue = getValue(pointCoords.baseValue);

    for (let i = 0; i < pointCoords.size; i++) {
        const x = pointCoords.items[i * COORDS_ITEM_SIZE + EChartPointItemOffset.x];
        const y =
            getValue(
                pointCoords.baseValue +
                    pointCoords.items[i * COORDS_ITEM_SIZE + EChartPointItemOffset.y],
            ) - modifiedBaseValue;

        items[i * CHART_POINT_ITEM_SIZE + EChartPointItemOffset.x] = x;
        items[i * CHART_POINT_ITEM_SIZE + EChartPointItemOffset.y] = y;

        const style = getStyle(
            sum(TIME_DELTA, pointCoords.interval[0], x),
            sum(modifiedBaseValue, y),
        );
        items[i * CHART_POINT_ITEM_SIZE + EChartPointItemOffset.color] = style.color;
        items[i * CHART_POINT_ITEM_SIZE + EChartPointItemOffset.width] = style.width;
    }

    return {
        ...pointCoords,
        items,
        baseValue: modifiedBaseValue,
        absLeftPoint: tryPrepareSidePoint(pointCoords.absLeftPoint, getValue, getStyle),
        absRightPoint: tryPrepareSidePoint(pointCoords.absRightPoint, getValue, getStyle),
    };
}

function tryPrepareSidePoint(
    point: Nil | TClosestPoint,
    getValue: (y: number) => number,
    getStyle: (x: Nanoseconds, y: number) => TInternalPointStyle,
): Nil | TClosestChartPoint {
    if (isNil(point)) {
        return point;
    }

    const x = sum(TIME_DELTA, point.x);
    const y = getValue(point.y);
    const style = getStyle(x, y);

    return {
        x: point.x,
        y,
        color: style.color,
        width: style.width,
    };
}

function getValueFactory(formula: undefined | string): (value: number) => number {
    const getValue = getNumberConversionSandbox(formula);

    if (isUndefined(getValue)) {
        return identity;
    }

    const ctx = { value: 0 };
    return (value: number) => {
        ctx.value = value;
        return getValue(ctx);
    };
}

export type TInternalPointStyle = {
    width: number;
    color: TPackedRGBA;
};

const getPackedRGBA = memoizee(hexToPackedRGBA, { primitive: true, length: 2, max: 100 });

function getStylerFactory({ style: { color, opacity, width }, styler }: TGetChartPointsProps) {
    const defaultStyle: TPointStyle = Object.freeze({
        width: isNumber(width) ? width : 1,
        color: isString(color) ? string2hex(color) : isNumber(color) ? color : 0x000000,
        opacity: isNumber(opacity) ? opacity : 1,
    });

    // style/args/out will be mutated, it save a lot of memory
    const style = { ...defaultStyle };
    const args: TPointStylerArgs = {
        time: 0 as Nanoseconds,
        value: 0,
    };
    const out: TInternalPointStyle = {
        width: 1,
        color: getPackedRGBA(0x000000, 1),
    };

    const sandbox = getPointStylerSandbox(styler);

    if (isUndefined(sandbox)) {
        out.color = getPackedRGBA(style.color, style.opacity);
        out.width = style.width;
        return () => out;
    }

    if (isFunction(sandbox)) {
        const ctx = { style, data: args, utils: stylerUtils };
        return (now: Nanoseconds, time: Nanoseconds, value: number): TInternalPointStyle => {
            style.width = defaultStyle.width;
            style.color = defaultStyle.color;
            style.opacity = defaultStyle.opacity;
            args.time = time;
            args.value = value;
            stylerUtils.now = now;
            sandbox(ctx);
            out.color = getPackedRGBA(style.color, style.opacity);
            out.width = style.width;
            return out;
        };
    }

    assertNever(sandbox);
}
