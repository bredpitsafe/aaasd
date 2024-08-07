import type { TSeriesId } from '@frontend/charter/lib/Parts/def';
import { EFollowMode } from '@frontend/charter/src/plugins/AutoFollowViewport/def';
import { EDefaultColors, getHexCssColor } from '@frontend/common/src/utils/colors';
import { EMPTY_ARRAY } from '@frontend/common/src/utils/const';
import { defaults, isNil } from 'lodash-es';
import type { ReactElement } from 'react';
import { useEffect, useMemo } from 'react';

import type { TChartPanelChartProps } from '../../types/panel';
import { DEFAULT_CHART_PROPS, DEFAULT_SETTINGS } from './def';
import { useChartContextMenu } from './hooks/useChartContextMenu';
import { useChartsVisibility } from './hooks/useChartsVisibility';
import { usePartsProvider } from './hooks/usePartsProvider';
import { useTimeseriesCharter } from './hooks/useTimeseriesCharter';
import type { TChartProps, TProps } from './types';
import { ChartView } from './view';

export function Chart(props: TProps): ReactElement {
    const settings = useMemo(() => {
        return defaults(
            {
                followMode:
                    props.settings.followMode ??
                    (props.backtestingId === undefined
                        ? DEFAULT_SETTINGS.followMode
                        : EFollowMode.lastPoint),
            },
            props.settings,
            DEFAULT_SETTINGS,
        );
    }, [props.backtestingId, props.settings]);

    const { hiddenChartIds, toggleChartVisibility } = useChartsVisibility(props.charts);

    const partsProvider = usePartsProvider({
        url: settings.url,
        backtestingId: props.backtestingId,
        charts: props.charts,
    });

    const timeseriesCharts = useMemo(
        () => getChartsForTimeSeries(props.charts, !isNil(props.backtestingId)),
        [props.charts, props.backtestingId],
    );

    const { charter, getChartClosestPoints, getMouseCoords, getPseudoMouseCoords } =
        useTimeseriesCharter({
            charts: timeseriesCharts,
            levels: props.levels ?? EMPTY_ARRAY,
            settings,
            currentTime: props.currentTime,
            timeNowIncrements: props.timeNowIncrements,
            hiddenChartIds,
            plugins: props.plugins,
            somesecondsToMilliseconds: props.somesecondsToMilliseconds,
            millisecondsToSomeseconds: props.millisecondsToSomeseconds,
            requestChunk: partsProvider.requestChunk,
            requestPoints: partsProvider.requestPoints,
            backtestingId: props.backtestingId,
            timeZoneInfo: props.timeZoneInfo,
            showPseudoHorizontalCrosshair: props.showPseudoHorizontalCrosshair,
            showPseudoHorizontalCrosshairTooltips: props.showPseudoHorizontalCrosshairTooltips,
        });

    const charts = useMemo(
        () => getChartsForLegends(props.charts, hiddenChartIds),
        [props.charts, hiddenChartIds],
    );

    const contextMenuRef = useChartContextMenu({
        charts,
        settings,
        onCopyLink: props.onCopyLink,
        onChangeSettings: props.onChangeSettings,
        somesecondsToMilliseconds: props.somesecondsToMilliseconds,
        millisecondsToSomeseconds: props.millisecondsToSomeseconds,
        getChartClosestPoints,

        charter,
        plugins: props.plugins,
    });

    useEffect(() => {
        if (isNil(props.onWebGLContextLost)) {
            return;
        }

        const canvasElement = charter.getView();

        const callback = (event: Event) => {
            event.preventDefault();
            props.onWebGLContextLost!();
        };

        canvasElement.addEventListener('webglcontextlost', callback, false);

        return () => canvasElement.removeEventListener('webglcontextlost', callback, false);
    }, [charter, props.onWebGLContextLost]);

    return (
        <ChartView
            ref={contextMenuRef}
            className={props.className}
            style={props.style}
            view={charter.getView()}
            panelId={props.panel.panelId}
            url={settings.url}
            backtestingId={props.backtestingId}
            charts={charts}
            schemes={props.schemes}
            showLegends={settings.legends !== false}
            onClickLegend={toggleChartVisibility}
            getChartClosestPoints={getChartClosestPoints}
            getMouseCoords={getMouseCoords}
            getPseudoMouseCoords={getPseudoMouseCoords}
            showPseudoHorizontalCrosshairTooltips={props.showPseudoHorizontalCrosshairTooltips}
        />
    );
}

function getChartsForLegends(
    charts: TChartPanelChartProps[],
    hiddenChartsIds: TSeriesId[],
): TChartProps[] {
    return charts.map((chart) =>
        defaults(
            {
                visible: !hiddenChartsIds.includes(chart.id),
                color: getHexCssColor(chart.color) ?? EDefaultColors.chart,
            },
            chart,
            DEFAULT_CHART_PROPS,
        ),
    );
}

function getChartsForTimeSeries(
    charts: TChartPanelChartProps[],
    hasBackTesting: boolean,
): TChartPanelChartProps[] {
    if (!hasBackTesting) {
        return charts;
    }

    return charts.map((chart) => defaults({ striving: false }, chart));
}
