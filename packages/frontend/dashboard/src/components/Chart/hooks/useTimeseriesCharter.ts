import type { Milliseconds, Minutes, Someseconds, TTimeZoneInfo } from '@common/types';
import { getCurrentUtcOffset, getNowMilliseconds, minutes2milliseconds } from '@common/utils';
import type { TPointAbsValue, TSeriesId } from '@frontend/charter/lib/Parts/def';
import { TimeseriesCharter } from '@frontend/charter/src';
import { EVirtualViewport } from '@frontend/charter/src/components/ChartViewport/defs';
import { AutoFollowViewport } from '@frontend/charter/src/plugins/AutoFollowViewport';
import { FitViewportOnResize } from '@frontend/charter/src/plugins/FitViewportOnResize';
import type { IPlugin } from '@frontend/charter/src/plugins/Plugin';
import { ScrollThroughPlugin } from '@frontend/charter/src/plugins/ScrollThroughPlugin';
import type {
    TTimeseriesCharterDeps,
    TTimeseriesCharterOptions,
} from '@frontend/charter/src/types';
import { DEFAULT_SERVER_TIME_INCREMENT } from '@frontend/common/src/defs/domain/chunks';
import type { TPoint } from '@frontend/common/src/types/shape';
import { EDefaultColors, getHexCssColor, string2hex } from '@frontend/common/src/utils/colors';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { shallowArrayDiff } from '@frontend/common/src/utils/shallowArrayDiff';
import { defaults } from 'lodash-es';
import { useEffect, useMemo } from 'react';
import { useMount, usePrevious, useUnmount } from 'react-use';

import type {
    TChartPanelChartProps,
    TChartPanelLevelProps,
    TPanelSettings,
} from '../../../types/panel';
import { CHART_WORLD_WIDTH_PRESETS, DEFAULT_CHART_PROPS, DEFAULT_SETTINGS } from '../def';
import { SyncViewportPlugin } from '../plugins/SyncViewport';
import { EChartWorldWidthPreset } from '../types';
import type { TMilliseconds2Someseconds, TSomeseconds2Milliseconds } from '../utils';

type TProps = {
    charts: TChartPanelChartProps[];
    levels: TChartPanelLevelProps[];
    currentTime?: Milliseconds;
    timeNowIncrements: Record<TSeriesId, Someseconds>;
    hiddenChartIds: TSeriesId[];
    settings: TPanelSettings;
    plugins?: IPlugin[];
    backtestingId?: number;
    requestChunk: TTimeseriesCharterDeps['requestPartsItems'];
    requestPoints: TTimeseriesCharterDeps['requestClosestPoints'];
    somesecondsToMilliseconds: TSomeseconds2Milliseconds;
    millisecondsToSomeseconds: TMilliseconds2Someseconds;
    timeZoneInfo: TTimeZoneInfo;
    showPseudoHorizontalCrosshair: boolean;
    showPseudoHorizontalCrosshairTooltips: boolean;
};

export function useTimeseriesCharter(props: TProps) {
    const plugins: IPlugin[] = useMemo(
        () => createPlugins(props.plugins, props.settings.followMode),
        // `followMode` change is processed in a later `useEffect` hook to prevent recreating other plugins
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [props.plugins],
    );
    // Charter must be created once. Further props changes are processed in later effect hooks.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const charter = useMemo(() => createTimeseriesCharter(plugins, props), []);
    const getChartClosestPoints = useFunction(() => {
        const timeZoneShift =
            props.millisecondsToSomeseconds(minutes2milliseconds(getCurrentUtcOffset())) +
            charter.getTimeZone();

        return charter.getClosestPoints().map(({ id, point, nonNaNPoint, canvasPoint }) => ({
            id,
            point: {
                x: (point.x + charter.getServerTimeIncrement() - timeZoneShift) as TPointAbsValue,
                y: point.y,
            },
            nonNaNPoint:
                nonNaNPoint === undefined
                    ? undefined
                    : {
                          x: (nonNaNPoint.x +
                              charter.getServerTimeIncrement() -
                              timeZoneShift) as TPointAbsValue,
                          y: nonNaNPoint.y,
                      },
            canvasPoint,
        }));
    });

    const getMouseCoords = useFunction((): TPoint => {
        const canvasCoords = charter.getMouseCoords();
        const viewportOffset = charter.getView().getBoundingClientRect();

        return { x: viewportOffset.left + canvasCoords.x, y: viewportOffset.top + canvasCoords.y };
    });

    const getPseudoMouseCoords = useFunction((): TPoint => {
        const canvasCoords = charter.getPseudoMouseCoords();
        const viewportOffset = charter.getView().getBoundingClientRect();

        return { x: viewportOffset.left + canvasCoords.x, y: viewportOffset.top + canvasCoords.y };
    });

    useTimeseriesCharterUpdates(charter, plugins, props);

    useUnmount(() => charter.destroy());

    return { charter, getChartClosestPoints, getMouseCoords, getPseudoMouseCoords };
}

function useTimeseriesCharterUpdates(
    charter: TimeseriesCharter,
    plugins: IPlugin[],
    props: TProps,
) {
    const {
        settings,
        millisecondsToSomeseconds,
        timeZoneInfo: { utcOffset },
    } = props;
    const prevPlugins = usePrevious(plugins);

    useEffect(() => {
        const autoFollowPlugin = plugins?.find(
            (p): p is AutoFollowViewport => p instanceof AutoFollowViewport,
        );

        autoFollowPlugin?.setFollowMode(settings.followMode ?? DEFAULT_SETTINGS.followMode);
    }, [plugins, settings.followMode]);

    useMount(() => {
        const syncViewportPlugin = plugins?.find(
            (p): p is SyncViewportPlugin => p instanceof SyncViewportPlugin,
        );

        syncViewportPlugin?.readyForSync(charter);
    });

    useEffect(() => {
        const { added, deleted } = shallowArrayDiff(prevPlugins ?? [], plugins ?? []);

        added.forEach((plugin) => charter.addPlugin(plugin));
        deleted.forEach((plugin) => charter.removePlugin(plugin));
    }, [charter, plugins, prevPlugins]);

    useEffect(
        () => () => charter.resetChartsData(),
        [charter, props.settings.url, props.backtestingId],
    );

    useEffect(() => {
        charter.setCharts(getCharts(props.charts, props.hiddenChartIds));
    }, [charter, props.charts, props.hiddenChartIds]);

    useEffect(() => {
        charter.setLevels(getLevels(props.levels));
    }, [charter, props.levels]);

    useEffect(() => {
        charter.toggleMouseClosestPoints(settings.closestPoints ?? DEFAULT_SETTINGS.closestPoints);
    }, [charter, settings.closestPoints]);

    useEffect(() => {
        const timeZoneShift = millisecondsToSomeseconds(
            minutes2milliseconds(-utcOffset as Minutes),
        );
        charter.setTimeZone(timeZoneShift);
    }, [charter, millisecondsToSomeseconds, utcOffset]);

    useEffect(() => {
        charter.setTimeNowIncrements(props.timeNowIncrements);
    }, [charter, props.timeNowIncrements]);

    useEffect(() => charter.setMinY(settings.minY), [charter, settings.minY]);
    useEffect(() => charter.setMaxY(settings.maxY), [charter, settings.maxY]);
    useEffect(() => charter.setFixedMinY(settings.fixedMinY), [charter, settings.fixedMinY]);
    useEffect(() => charter.setFixedMaxY(settings.fixedMaxY), [charter, settings.fixedMaxY]);
    useEffect(() => charter.setMinYRight(settings.minYRight), [charter, settings.minYRight]);
    useEffect(() => charter.setMaxYRight(settings.maxYRight), [charter, settings.maxYRight]);
    useEffect(() => charter.setMaxYRight(settings.maxYRight), [charter, settings.maxYRight]);
    useEffect(
        () => charter.setFixedMinYRight(settings.fixedMinYRight),
        [charter, settings.fixedMinYRight],
    );
    useEffect(() => charter.setMinWorldWidth(settings.minWidth), [charter, settings.minWidth]);
    useEffect(() => {
        // If not provided, set max width as 1 year
        charter.setMaxWorldWidth(
            settings.maxWidth ?? CHART_WORLD_WIDTH_PRESETS[EChartWorldWidthPreset.Month] * 12,
        );
    }, [charter, settings.maxWidth]);
    useEffect(
        () => charter.setZoomStepMultiplier(settings.zoomStepMultiplier ?? 1),
        [charter, settings.zoomStepMultiplier],
    );
    useEffect(() => {
        charter.toggleDisplayZero(EVirtualViewport.left, settings.displayZeroLeft ?? false);
    }, [charter, settings.displayZeroLeft]);
    useEffect(() => {
        charter.toggleDisplayZero(EVirtualViewport.right, settings.displayZeroRight ?? false);
    }, [charter, settings.displayZeroRight]);
    useEffect(() => {
        if (settings.focusTo !== undefined && isFinite(settings.focusTo)) {
            charter.focusTo(settings.focusTo);
        }
    }, [charter, settings.focusTo]);
    useEffect(() => {
        if (typeof props.currentTime === 'number') {
            charter.focusToWithShift(
                millisecondsToSomeseconds(props.currentTime),
                -0.3, // shift = minus 30 percent
            );
        }
    }, [charter, millisecondsToSomeseconds, props.currentTime]);
    useEffect(() => {
        charter.setPseudoHorizontalCrosshairVisibility(props.showPseudoHorizontalCrosshair);
    }, [charter, props.showPseudoHorizontalCrosshair]);

    useEffect(() => {
        charter.setChartsTooltipsVisibility(props.showPseudoHorizontalCrosshairTooltips);
    }, [charter, props.showPseudoHorizontalCrosshairTooltips]);
}

function createPlugins(
    plugins: TProps['plugins'],
    followMode: TProps['settings']['followMode'],
): IPlugin[] {
    return [
        ...(plugins ?? []),
        new AutoFollowViewport(followMode),
        new ScrollThroughPlugin(),
        new FitViewportOnResize(),
    ];
}
function createTimeseriesCharter(plugins: IPlugin[], props: TProps) {
    const {
        settings,
        millisecondsToSomeseconds,
        timeZoneInfo: { utcOffset },
        showPseudoHorizontalCrosshair,
        showPseudoHorizontalCrosshairTooltips,
    } = props;

    const timeZoneShift = millisecondsToSomeseconds(minutes2milliseconds(-utcOffset as Minutes));

    const charter = new TimeseriesCharter(
        {
            charts: getCharts(props.charts, props.hiddenChartIds),
            levels: getLevels(props.levels),

            timeZone: timeZoneShift,

            serverTimeIncrement:
                settings.serverTimeIncrement ??
                props.millisecondsToSomeseconds(DEFAULT_SERVER_TIME_INCREMENT),

            somesecondsToMillisecondsRatio: props.somesecondsToMilliseconds(
                1 as Someseconds,
            ) as number,
            millisecondsToSomesecondsRatio: props.millisecondsToSomeseconds(1 as Milliseconds),

            minY: settings.minY,
            maxY: settings.maxY,
            fixedMinY: settings.fixedMinY,
            fixedMaxY: settings.fixedMaxY,

            minYRight: settings.minYRight,
            maxYRight: settings.maxYRight,
            fixedMinYRight: settings.fixedMinYRight,
            fixedMaxYRight: settings.fixedMaxYRight,

            minWidth: settings.minWidth,
            maxWidth: settings.maxWidth,

            enableClosestPoints: settings.closestPoints ?? DEFAULT_SETTINGS.closestPoints,

            showPseudoHorizontalCrosshair,
            showPseudoHorizontalCrosshairTooltips,
        },
        {
            requestPartsItems: props.requestChunk,
            requestClosestPoints: props.requestPoints,
        },
    );

    // Set default zoom to 1 hour
    charter.setWorldWidth(CHART_WORLD_WIDTH_PRESETS[EChartWorldWidthPreset.Hour]);
    // Set default viewport position
    charter.focusTo(millisecondsToSomeseconds(getNowMilliseconds()));

    return charter;
}

function getCharts(
    charts: TChartPanelChartProps[],
    hiddenChartsIds: TSeriesId[],
): Exclude<TTimeseriesCharterOptions['charts'], undefined> {
    return charts.map((chart) =>
        defaults(
            {
                visible: !hiddenChartsIds.includes(chart.id),
                color: string2hex(getHexCssColor(chart.color) ?? EDefaultColors.chart),
            },
            chart,
            DEFAULT_CHART_PROPS,
        ),
    );
}

function getLevels(
    levels: TChartPanelLevelProps[],
): Exclude<TTimeseriesCharterOptions['levels'], undefined> {
    return levels.map(
        (level) => {
            return defaults(
                {
                    color: string2hex(getHexCssColor(level.color) ?? EDefaultColors.level),
                },
                level,
                DEFAULT_CHART_PROPS,
            );
        },
        [] as Exclude<TTimeseriesCharterOptions['levels'], undefined>,
    );
}
