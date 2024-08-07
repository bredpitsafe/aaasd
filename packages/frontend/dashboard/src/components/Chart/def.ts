import type { Milliseconds, Nanoseconds, Someseconds } from '@common/types';
import {
    dayInMilliseconds,
    hourInMilliseconds,
    milliseconds2nanoseconds,
    minuteInMilliseconds,
    monthInMilliseconds,
} from '@common/utils';
import { EChartType } from '@frontend/charter/src/components/Chart/defs';
import { EVirtualViewport } from '@frontend/charter/src/components/ChartViewport/defs';
import { EFollowMode } from '@frontend/charter/src/plugins/AutoFollowViewport/def';
import { DEFAULT_SERVER_TIME_INCREMENT } from '@frontend/common/src/defs/domain/chunks';

import { EServerTimeUnit } from '../../types/panel';
import { EChartWorldWidthPreset } from './types';

export const DEFAULT_SETTINGS = {
    followMode: EFollowMode.permament,
    closestPoints: true,
    serverTimeUnit: EServerTimeUnit.nanosecond,
    serverTimeIncrement: milliseconds2nanoseconds(
        DEFAULT_SERVER_TIME_INCREMENT,
    ) as unknown as Someseconds,
    minWidth: 1e3 as Someseconds,
    maxWidth: (1e9 * 60 * 60 * 24 * 365 * 3) as Someseconds, // 3 years
} as const;

export const DEFAULT_CHART_PROPS = {
    type: EChartType.stairs,
    visible: true,
    width: 1,
    opacity: 1,
    yAxis: EVirtualViewport.left,
} as const;

export const CHART_WORLD_WIDTH_PRESETS: Record<EChartWorldWidthPreset, Nanoseconds> = {
    [EChartWorldWidthPreset.Minute]: milliseconds2nanoseconds(minuteInMilliseconds as Milliseconds),
    [EChartWorldWidthPreset.FifteenMinutes]: milliseconds2nanoseconds(
        (15 * minuteInMilliseconds) as Milliseconds,
    ),
    [EChartWorldWidthPreset.ThirtyMinutes]: milliseconds2nanoseconds(
        (30 * minuteInMilliseconds) as Milliseconds,
    ),
    [EChartWorldWidthPreset.Hour]: milliseconds2nanoseconds(hourInMilliseconds as Milliseconds),
    [EChartWorldWidthPreset.Day]: milliseconds2nanoseconds(dayInMilliseconds as Milliseconds),
    [EChartWorldWidthPreset.Month]: milliseconds2nanoseconds(monthInMilliseconds as Milliseconds),
};
