import type { Nanoseconds } from '@common/types';
import type { Assign, Nil } from '@common/types';
import { sum } from '@common/utils';
import { assertNever } from '@common/utils/src/assert.ts';
import { isFunction, isNil, isNumber, isString, isUndefined } from 'lodash-es';
import memoizee from 'memoizee';
import { identity } from 'rxjs';

import { string2hex } from '../../../utils/colors';
import type { TPackedRGBA } from '../../../utils/packRGBA';
import { hexToPackedRGBA } from '../../../utils/packRGBA';
import { getNumberConversionSandbox } from '../../../utils/Sandboxes/numberConversion';
import type { TPointStyle, TPointStylerArgs } from '../../../utils/Sandboxes/pointStyler';
import { getPointStylerSandbox, stylerUtils } from '../../../utils/Sandboxes/pointStyler';
import type { TClosestChartPoint, TClosestPoint } from './defs';
import { CHART_POINT_ITEM_SIZE, COORDS_ITEM_SIZE, EChartPointItemOffset, TIME_DELTA } from './defs';
import type { TGetPointsCoordsReturnType } from './ModuleGetIndicatorPoints.ts';

export function createChartPoints(
    points: TGetPointsCoordsReturnType,
    getValue: ReturnType<typeof getValueFactory>,
    getStyle: ReturnType<typeof getStyleFactory>,
): Assign<
    TGetPointsCoordsReturnType,
    {
        absLeftPoint: Nil | TClosestChartPoint;
        absRightPoint: Nil | TClosestChartPoint;
    }
> {
    const items: number[] = Array.from({
        length: (points.items.length * CHART_POINT_ITEM_SIZE) / COORDS_ITEM_SIZE,
    });

    const modifiedBaseValue = getValue(points.baseValue);

    for (let i = 0; i < points.size; i++) {
        const x = points.items[i * COORDS_ITEM_SIZE + EChartPointItemOffset.x];
        const y =
            getValue(
                points.baseValue + points.items[i * COORDS_ITEM_SIZE + EChartPointItemOffset.y],
            ) - modifiedBaseValue;

        items[i * CHART_POINT_ITEM_SIZE + EChartPointItemOffset.x] = x;
        items[i * CHART_POINT_ITEM_SIZE + EChartPointItemOffset.y] = y;

        const style = getStyle(sum(TIME_DELTA, points.interval[0], x), sum(modifiedBaseValue, y));
        items[i * CHART_POINT_ITEM_SIZE + EChartPointItemOffset.color] = style.color;
        items[i * CHART_POINT_ITEM_SIZE + EChartPointItemOffset.width] = style.width;
    }

    return {
        ...points,
        items,
        baseValue: modifiedBaseValue,
        absLeftPoint: tryPrepareSidePoint(points.absLeftPoint, getValue, getStyle),
        absRightPoint: tryPrepareSidePoint(points.absRightPoint, getValue, getStyle),
    };
}

export function getValueFactory(formula: undefined | string): (value: number) => number {
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

export type TInternalPointStyle = {
    width: number;
    color: TPackedRGBA;
};

const getPackedRGBA = memoizee(hexToPackedRGBA, { primitive: true, length: 2, max: 100 });

export function getStyleFactory(
    { width, color, opacity }: TPointStyle,
    styler: undefined | string,
): (time: Nanoseconds, value: number) => TInternalPointStyle {
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
        return (time: Nanoseconds, value: number): TInternalPointStyle => {
            style.width = defaultStyle.width;
            style.color = defaultStyle.color;
            style.opacity = defaultStyle.opacity;
            args.time = time;
            args.value = value;
            sandbox(ctx);
            out.color = getPackedRGBA(style.color, style.opacity);
            out.width = style.width;
            return out;
        };
    }

    assertNever(sandbox);
}
