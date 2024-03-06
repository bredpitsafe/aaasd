import dayjs from 'dayjs';
import { clamp } from 'lodash-es';

import { DEFAULT_SERVER_TIME_INCREMENT } from '../../../defs/domain/chunks';
import type { TFetchChunksProps } from '../../../handlers/charts/fetchChunksHandle';
import type { Assign, Nil } from '../../../types';
import type { Minutes, Nanoseconds } from '../../../types/time';
import type { TPackedRGBA } from '../../../utils/packRGBA';
import {
    milliseconds2nanoseconds,
    minutes2milliseconds,
    nanoseconds2milliseconds,
    toNanoseconds,
} from '../../../utils/time';
import type { TraceId } from '../../../utils/traceId';

export const TIME_DELTA = milliseconds2nanoseconds(DEFAULT_SERVER_TIME_INCREMENT);
export const POINTS_SHARE_RESET_DELAY = minutes2milliseconds(2 as Minutes);
export const CHART_POINT_ITEM_SIZE = 4;
export const COORDS_ITEM_SIZE = 2;

export enum EChartPointItemOffset {
    x = 0,
    y = 1,
    color = 2,
    width = 3,
}

export enum ECoordsPointItemOffset {
    x = 0,
    y = 1,
}

export type TClosestPoint = { x: Nanoseconds; y: number };

export type TUnresolvedState = false | 'live' | 'failed';

export type TClosestChartPoint = TClosestPoint & {
    color: TPackedRGBA;
    width: number;
};

export type TPointStyle = {
    width: number;
    color: number;
    opacity: number;
};

export type TPointStylerArgs = {
    time: Nanoseconds;
    value: number;
};

export const stylerUtils = {
    now: toNanoseconds(0),
    getYear: (time: Nanoseconds) => dayjs(nanoseconds2milliseconds(time)).year(),
    getMonth: (time: Nanoseconds) => dayjs(nanoseconds2milliseconds(time)).month(),
    getDate: (time: Nanoseconds) => dayjs(nanoseconds2milliseconds(time)).date(),
    getDay: (time: Nanoseconds) => dayjs(nanoseconds2milliseconds(time)).day(),
    getHour: (time: Nanoseconds) => dayjs(nanoseconds2milliseconds(time)).hour(),
    getMinute: (time: Nanoseconds) => dayjs(nanoseconds2milliseconds(time)).minute(),
    getSecond: (time: Nanoseconds) => dayjs(nanoseconds2milliseconds(time)).second(),
    getMillisecond: (time: Nanoseconds) => dayjs(nanoseconds2milliseconds(time)).millisecond(),
    clamp,
    isNaN: Number.isNaN,
};

export type TPointStylerUtils = typeof stylerUtils;

export type TGetChartPointsProps = TGetPointsCoordsProps & {
    style: TPointStyle;
    styler: undefined | string;
    formula: undefined | string;
};

export type TGetChartPointsReturnType = Assign<
    TGetPointsCoordsReturnType,
    {
        absLeftPoint: Nil | TClosestChartPoint;
        absRightPoint: Nil | TClosestChartPoint;
    }
>;

export type TGetPointsCoordsProps = Omit<TFetchChunksProps, 'epoch'> & {
    traceId: TraceId;
};

export type TGetPointsCoordsReturnType = {
    size: number;
    items: number[];
    interval: [Nanoseconds, Nanoseconds];
    baseValue: number;
    unresolved: false | 'live' | 'failed';
    absLeftPoint: Nil | TClosestPoint;
    absRightPoint: Nil | TClosestPoint;
};
