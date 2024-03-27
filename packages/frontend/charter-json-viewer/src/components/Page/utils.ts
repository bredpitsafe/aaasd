import { TSeriesId } from '@frontend/charter/lib/Parts/def';
import { TChartProps } from '@frontend/charter/src/services/ChartsController';
import { Assign } from '@frontend/common/src/types';
import { Someseconds } from '@frontend/common/src/types/time';
import { EMPTY_ARRAY, EMPTY_OBJECT } from '@frontend/common/src/utils/const';
import { getRandomInt32 } from '@frontend/common/src/utils/random';
import { milliseconds2nanoseconds } from '@frontend/common/src/utils/time';
import { get, isArray, isObject } from 'lodash-es';

import { TChartJSON, TChartWithItems } from '../../types';
import { DEFAULT_CHART_PROPS, DEFAULT_SERVER_TIME_INCREMENT, EServerTimeUnit } from '../Chart/def';

export function convertToChart(v: unknown | number[] | Partial<TChartJSON>): TChartWithItems {
    const isObj = isObject(v);
    const timeUnit = (isObj && get(v, 'timeUnit')) || EServerTimeUnit.nanosecond;
    const timeIncrement = (isObj && get(v, 'timeIncrement')) || (0 as Someseconds);
    const items =
        isObj && isArray(get(v, 'items')) ? get(v, 'items') : isArray(v) ? v : EMPTY_ARRAY;

    return fillChartProps({
        ...(isObj ? v : EMPTY_OBJECT),
        // @ts-ignore
        items: prepareItemsTime(items, timeUnit, timeIncrement),
    });
}

function prepareItemsTime(
    items: number[],
    timeUnit: EServerTimeUnit,
    _timeIncrement: number,
): number[] {
    const multiplier = getMultiplier(timeUnit);
    const timeIncrement =
        _timeIncrement * multiplier - milliseconds2nanoseconds(DEFAULT_SERVER_TIME_INCREMENT);

    if (timeIncrement !== 0 || multiplier !== 1) {
        for (let i = 0; i < items.length; i += 2) {
            items[i] = items[i] * multiplier + timeIncrement;
        }
    }

    return items;
}

function getMultiplier(unit: EServerTimeUnit): number {
    return unit === EServerTimeUnit.second
        ? 1e9
        : unit === EServerTimeUnit.millisecond
          ? 1e6
          : unit === EServerTimeUnit.microsecond
            ? 1e3
            : 1;
}

function fillChartProps(
    v: Assign<
        Partial<TChartProps>,
        {
            items: number[];
        }
    >,
): TChartWithItems {
    return {
        ...DEFAULT_CHART_PROPS,
        ...v,
        id: v.id ?? (`Chart #${getRandomInt32()}` as TSeriesId),
        color: 0xffffff * Math.random(),
    };
}
