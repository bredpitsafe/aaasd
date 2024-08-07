import type { Minutes, Nanoseconds } from '@common/types';
import { milliseconds2nanoseconds, minutes2milliseconds } from '@common/utils';

import { DEFAULT_SERVER_TIME_INCREMENT } from '../../../defs/domain/chunks';
import type { TPackedRGBA } from '../../../utils/packRGBA';

export const TIME_DELTA = milliseconds2nanoseconds(DEFAULT_SERVER_TIME_INCREMENT);
export const POINTS_SHARE_RESET_DELAY = minutes2milliseconds(1 as Minutes);
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
