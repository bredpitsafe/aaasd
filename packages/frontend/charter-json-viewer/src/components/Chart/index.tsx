import { TSeriesId } from '@frontend/charter/lib/Parts/def';
import { TWithClassname } from '@frontend/common/src/types/components';
import { EDefaultColors, getHexCssColor } from '@frontend/common/src/utils/colors';
import { getFirstSecondsToSecondSeconds } from '@frontend/dashboard/src/components/Chart/utils';
import { defaults } from 'lodash-es';
import { ReactElement, useMemo } from 'react';

import { TChartProps, TChartWithItems } from '../../types';
import { DEFAULT_CHART_PROPS, DEFAULT_SETTINGS } from './def';
import { useChartsVisibility } from './hooks/useChartsVisibility';
import { usePartsProvider } from './hooks/usePartsProvider';
import { useTimeseriesCharter } from './hooks/useTimeseriesCharter';
import { ChartView } from './view';

type TConnectedChartProps = TWithClassname & {
    charts: TChartWithItems[];
};

export function ConnectedChart(props: TConnectedChartProps): ReactElement {
    const settings = DEFAULT_SETTINGS;

    const { somesecondsToMilliseconds, millisecondsToSomeseconds } = useMemo(
        () => getFirstSecondsToSecondSeconds(settings.serverTimeUnit),
        [settings.serverTimeUnit],
    );

    const { hiddenChartIds, toggleChartVisibility } = useChartsVisibility(props.charts);

    const partsProvider = usePartsProvider(props);

    const { charter, getChartClosestPoints } = useTimeseriesCharter({
        charts: props.charts,
        somesecondsToMilliseconds,
        millisecondsToSomeseconds,
        hiddenChartIds,
        requestChunk: partsProvider.requestChunk,
        requestPoints: partsProvider.requestPoints,
    });

    const charts = useMemo(
        () => getChartsForLegends(props.charts, hiddenChartIds),
        [props.charts, hiddenChartIds],
    );

    return (
        <ChartView
            className={props.className}
            view={charter.getView()}
            charts={charts}
            onClickLegend={toggleChartVisibility}
            getChartClosestPoints={getChartClosestPoints}
        />
    );
}

function getChartsForLegends(charts: TChartProps[], hiddenChartsIds: TSeriesId[]): TChartProps[] {
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
