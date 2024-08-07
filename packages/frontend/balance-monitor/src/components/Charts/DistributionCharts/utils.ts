import { blue, gold, green, red } from '@ant-design/colors';
import type { AgColumnSeriesOptions } from 'ag-charts-community';
import type { CssColor } from 'ag-charts-community/dist/esm/es6/chart/agChartOptions';
import { merge } from 'lodash-es';

import type { TPlainExchangeStats } from './defs';

const COMMON_SERIES_OPTIONS: Partial<AgColumnSeriesOptions<TPlainExchangeStats>> = {
    type: 'column',
    xKey: 'exchangeName',
    strokeWidth: 0,
    fillOpacity: 0.6,
    highlightStyle: {
        item: {
            fillOpacity: 1,
        },
    },
};

export const SERIES_OPTIONS: AgColumnSeriesOptions<TPlainExchangeStats>[] = [
    merge(
        {
            yName: 'Min',
            yKey: 'minBalance',
        },
        getColorForSeries(red[6]),
        COMMON_SERIES_OPTIONS,
    ),
    merge(
        {
            yName: 'Current',
            yKey: 'currentBalance',
        },
        getColorForSeries(red[3]),
        COMMON_SERIES_OPTIONS,
    ),
    merge(
        {
            yName: 'Target',
            yKey: 'targetBalance',
        },
        getColorForSeries(gold[6]),
        COMMON_SERIES_OPTIONS,
    ),
    merge(
        {
            yName: 'Suggested',
            yKey: 'newBalance',
        },
        getColorForSeries(blue[6]),
        COMMON_SERIES_OPTIONS,
    ),
    merge(
        {
            yName: 'Max',
            yKey: 'maxBalance',
            visible: false,
        },
        getColorForSeries(green[6]),
        COMMON_SERIES_OPTIONS,
    ),
];

function getColorForSeries(color: CssColor): Partial<AgColumnSeriesOptions<TPlainExchangeStats>> {
    return {
        fill: color,
        highlightStyle: {
            item: {
                fill: color,
            },
        },
    };
}
