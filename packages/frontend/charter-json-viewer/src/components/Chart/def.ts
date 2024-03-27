import { EChartType } from '@frontend/charter/src/components/Chart/defs';
import { EVirtualViewport } from '@frontend/charter/src/components/ChartViewport/defs';
import { EFollowMode } from '@frontend/charter/src/plugins/AutoFollowViewport/def';
import { Milliseconds, Nanoseconds, Someseconds } from '@frontend/common/src/types/time';
import {
    dayInMilliseconds,
    hourInMilliseconds,
    milliseconds2nanoseconds,
    minuteInMilliseconds,
    monthInMilliseconds,
    timeZoneOffsetMilliseconds,
} from '@frontend/common/src/utils/time';

import { TChartProps } from '../../types';

export enum EServerTimeUnit {
    nanosecond = 'nanosecond',
    millisecond = 'millisecond',
    microsecond = 'microsecond',
    second = 'second',
}

export const DEFAULT_SERVER_TIME_INCREMENT = 1609459200000 as Milliseconds;

export const DEFAULT_TIME_ZONE = timeZoneOffsetMilliseconds;

export const DEFAULT_SETTINGS = {
    followMode: EFollowMode.none,
    closestPoints: true,
    serverTimeUnit: EServerTimeUnit.nanosecond,
    serverTimeIncrement: milliseconds2nanoseconds(
        DEFAULT_SERVER_TIME_INCREMENT,
    ) as unknown as Someseconds,
    timeZone: milliseconds2nanoseconds(DEFAULT_TIME_ZONE) as unknown as Someseconds,
    minWidth: 1e3 as Someseconds,
    maxWidth: (1e9 * 60 * 60 * 24 * 365 * 3) as Someseconds, // 3 years
} as const;

export const DEFAULT_CHART_PROPS: Omit<TChartProps, 'id'> = {
    type: EChartType.stairs,
    width: 1,
    color: 0x00ff00,
    opacity: 1,
    visible: true,
    yAxis: EVirtualViewport.left,
};

export enum EChartWorldWidthPreset {
    Minute = '1m',
    FifteenMinutes = '15m',
    ThirtyMinutes = '30m',
    Hour = '1h',
    Day = '1D',
    Month = '1M',
}

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
