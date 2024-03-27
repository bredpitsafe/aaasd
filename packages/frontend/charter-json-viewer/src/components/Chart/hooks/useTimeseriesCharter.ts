import { TSeriesId } from '@frontend/charter/lib/Parts/def';
import { TimeseriesCharter } from '@frontend/charter/src';
import { FitViewportOnResize } from '@frontend/charter/src/plugins/FitViewportOnResize';
import type { IPlugin } from '@frontend/charter/src/plugins/Plugin';
import { ScrollThroughPlugin } from '@frontend/charter/src/plugins/ScrollThroughPlugin';
import type { TChartProps } from '@frontend/charter/src/services/ChartsController';
import { TClosestPointData } from '@frontend/charter/src/services/MouseClosestPointsController';
import type {
    TTimeseriesCharterDeps,
    TTimeseriesCharterOptions,
} from '@frontend/charter/src/types';
import type { Milliseconds, Someseconds } from '@frontend/common/src/types/time';
import { plus } from '@frontend/common/src/utils/math';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { timeZoneOffsetMilliseconds } from '@frontend/common/src/utils/time';
import type {
    TMilliseconds2Someseconds,
    TSomeseconds2Milliseconds,
} from '@frontend/dashboard/src/components/Chart/utils';
import { useEffect, useMemo } from 'react';
import { useUnmount } from 'react-use';

import {
    CHART_WORLD_WIDTH_PRESETS,
    DEFAULT_SERVER_TIME_INCREMENT,
    DEFAULT_SETTINGS,
    DEFAULT_TIME_ZONE,
    EChartWorldWidthPreset,
} from '../def';

type TProps = {
    charts: TChartProps[];
    hiddenChartIds: TSeriesId[];
    requestChunk: TTimeseriesCharterDeps['requestPartsItems'];
    requestPoints: TTimeseriesCharterDeps['requestClosestPoints'];
    somesecondsToMilliseconds: TSomeseconds2Milliseconds;
    millisecondsToSomeseconds: TMilliseconds2Someseconds;
};

export function useTimeseriesCharter(props: TProps) {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const charter = useMemo(() => createTimeseriesCharter(props), []);
    const getChartClosestPoints = useFunction(() => {
        const timeZoneShift = props.millisecondsToSomeseconds(timeZoneOffsetMilliseconds);

        return charter.getClosestPoints().map(
            ({ id, point, nonNaNPoint }): TClosestPointData => ({
                id,
                point: {
                    x: plus(point.x, timeZoneShift),
                    y: point.y,
                    color: point.color,
                    width: point.width,
                },
                nonNaNPoint:
                    nonNaNPoint === undefined
                        ? undefined
                        : {
                              x: plus(nonNaNPoint.x, timeZoneShift),
                              y: nonNaNPoint.y,
                              color: nonNaNPoint.color,
                              width: nonNaNPoint.width,
                          },
            }),
        );
    });

    useTimeseriesCharterUpdates(charter, props);

    useUnmount(() => charter.destroy());

    return { charter, getChartClosestPoints };
}

function useTimeseriesCharterUpdates(charter: TimeseriesCharter, props: TProps) {
    const settings = DEFAULT_SETTINGS;

    useEffect(() => {
        charter.setCharts(getCharts(props.charts, props.hiddenChartIds));
    }, [charter, props.charts, props.hiddenChartIds]);

    // useEffect(() => {
    //     if (typeof props.currentTime === 'number') {
    //         charter.focusToWithShift(
    //             props.millisecondsToSomeseconds(props.currentTime),
    //             -0.3, // shift = minus 30 percent
    //         );
    //     }
    // }, [props.currentTime]);

    useEffect(() => {
        charter.toggleMouseClosestPoints(settings.closestPoints ?? DEFAULT_SETTINGS.closestPoints);
    }, [charter, settings.closestPoints]);

    useEffect(() => {
        charter.setTimeZone(
            settings.timeZone ?? props.millisecondsToSomeseconds(DEFAULT_TIME_ZONE),
        );
    }, [charter, props, settings.timeZone]);
    // useEffect(() => charter.setMinY(settings.minY), [settings.minY]);
    // useEffect(() => charter.setMaxY(settings.maxY), [settings.maxY]);
    // useEffect(() => charter.setFixedMinY(settings.fixedMinY), [
    //     settings.fixedMinY,
    // ]);
    // useEffect(() => charter.setFixedMaxY(settings.fixedMaxY), [
    //     settings.fixedMaxY,
    // ]);
    // useEffect(() => charter.setMinYRight(settings.minYRight), [
    //     settings.minYRight,
    // ]);
    // useEffect(() => charter.setMaxYRight(settings.maxYRight), [
    //     settings.maxYRight,
    // ]);
    // useEffect(() => charter.setMaxYRight(settings.maxYRight), [
    //     settings.maxYRight,
    // ]);
    // useEffect(() => charter.setFixedMinYRight(settings.fixedMinYRight), [
    //     settings.fixedMinYRight,
    // ]);
    // useEffect(() => charter.setMinWorldWidth(settings.minWidth), [
    //     settings.minWidth,
    // ]);
    useEffect(() => {
        // If not provided, set max width as 1 year
        charter.setMaxWorldWidth(
            settings.maxWidth ?? CHART_WORLD_WIDTH_PRESETS[EChartWorldWidthPreset.Month] * 12,
        );
    }, [charter, settings.maxWidth]);
    // useEffect(
    //     () => charter.setZoomStepMultiplier(settings.zoomStepMultiplier ?? 1),
    //     [settings.zoomStepMultiplier],
    // );
    // useEffect(() => {
    //     charter.toggleDisplayZero(
    //         EVirtualViewport.left,
    //         settings.displayZeroLeft ?? false,
    //     );
    // }, [settings.displayZeroLeft]);
    // useEffect(() => {
    //     charter.toggleDisplayZero(
    //         EVirtualViewport.right,
    //         settings.displayZeroRight ?? false,
    //     );
    // }, [settings.displayZeroRight]);
}

function createPlugins(): IPlugin[] {
    return [new ScrollThroughPlugin(), new FitViewportOnResize()];
}

function createTimeseriesCharter(props: TProps) {
    const settings = DEFAULT_SETTINGS;

    const charter = new TimeseriesCharter(
        {
            charts: props.charts,

            timeZone: settings.timeZone ?? props.millisecondsToSomeseconds(DEFAULT_TIME_ZONE),

            serverTimeIncrement:
                settings.serverTimeIncrement ??
                props.millisecondsToSomeseconds(DEFAULT_SERVER_TIME_INCREMENT),

            somesecondsToMillisecondsRatio: props.somesecondsToMilliseconds(
                1 as Someseconds,
            ) as number,
            millisecondsToSomesecondsRatio: props.millisecondsToSomeseconds(1 as Milliseconds),

            // minY: settings.minY,
            // maxY: settings.maxY,
            // fixedMinY: settings.fixedMinY,
            // fixedMaxY: settings.fixedMaxY,
            //
            // minYRight: settings.minYRight,
            // maxYRight: settings.maxYRight,
            // fixedMinYRight: settings.fixedMinYRight,
            // fixedMaxYRight: settings.fixedMaxYRight,

            minWidth: settings.minWidth,
            maxWidth: settings.maxWidth,

            enableClosestPoints: settings.closestPoints ?? DEFAULT_SETTINGS.closestPoints,
        },
        {
            requestPartsItems: props.requestChunk,
            requestClosestPoints: props.requestPoints,
            plugins: createPlugins(),
        },
    );

    // Set default zoom to 1 hour
    charter.setWorldWidth(CHART_WORLD_WIDTH_PRESETS[EChartWorldWidthPreset.Hour]);

    // if (settings.focusTo !== undefined && isFinite(settings.focusTo)) {
    //     charter.focusTo(settings.focusTo);
    // }

    return charter;
}

function getCharts(
    charts: TChartProps[],
    hiddenChartsIds: TSeriesId[],
): Exclude<TTimeseriesCharterOptions['charts'], undefined> {
    return charts.map((chart) => ({
        ...chart,
        visible: !hiddenChartsIds.includes(chart.id),
    }));
}
