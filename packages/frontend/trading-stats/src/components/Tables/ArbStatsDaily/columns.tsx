import type { TimeZone } from '@common/types';
import { EDateTimeFormats } from '@common/types';
import type { ColDef, ValueFormatterParams, ValueGetterParams } from '@frontend/ag-grid';
import { lowerCaseComparator } from '@frontend/ag-grid/src/comparators/lowerCaseComparator.ts';
import { dateFormatter } from '@frontend/common/src/components/AgTable/formatters/date';
import { numberFormatter } from '@frontend/common/src/components/AgTable/formatters/number';
import { formatUsd, formatUsdCompact } from '@frontend/common/src/utils/formatNumber/formatNumber';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { isNil, isNumber } from 'lodash-es';

import { createTimeTooltipRenderer } from '../BalancePnlDaily/renderers/TimeTooltipRenderer';
import { createFeesColumn } from './renderers/FeesRenderer';
import type { TArbStatsDailyAsset, TArbStatsDailyColumnValueWithAggregation } from './types';
import { EAggFuncs } from './utils';

dayjs.extend(utc);
dayjs.extend(timezone);

const valueGetters = {
    [EAggFuncs.MakerPercentage]: (params: ValueGetterParams<TArbStatsDailyAsset>) => {
        // no need to handle group levels - calculated in the aggregation func
        if (!params.node?.group && params.data) {
            const { makerVolumeUsd, volumeUsdToday } = params.data;
            return {
                makerVolumeUsd,
                volumeUsdToday,
                toString: () => String((makerVolumeUsd! / volumeUsdToday) * 100),
            };
        }
    },
    [EAggFuncs.TakerPercentage]: (params: ValueGetterParams<TArbStatsDailyAsset>) => {
        // no need to handle group levels - calculated in the aggregation func
        if (!params.node?.group && params.data) {
            const { takerVolumeUsd, volumeUsdToday } = params.data;
            return {
                takerVolumeUsd,
                volumeUsdToday,
                toString: () => String((takerVolumeUsd! / volumeUsdToday) * 100),
            };
        }
    },
};

export const getColumns = (timeZone: TimeZone): ColDef<TArbStatsDailyAsset>[] => [
    {
        field: 'strategy',
        headerName: 'Strategy',
        rowGroup: true,
        enableRowGroup: true,
        hide: true,
        comparator: lowerCaseComparator,
    },
    {
        field: 'breakdown',
        headerName: 'Breakdown',
        rowGroup: true,
        enableRowGroup: true,
        hide: true,
    },
    {
        field: 'entityName',
        headerName: 'Exch./Asset',
    },
    {
        field: 'tradesToday',
        headerName: 'Trades',
        valueGetter: (params) => ({
            value: params.data?.tradesToday,
            shouldAggregate: params.data?.shouldAggregate,
        }),
        valueFormatter: (
            params: ValueFormatterParams<
                TArbStatsDailyAsset,
                TArbStatsDailyColumnValueWithAggregation
            >,
        ) => {
            const val = params.value;
            if (!isNil(val?.shouldAggregate) && !val?.shouldAggregate && !params.node?.group) {
                return `${val?.value}*`;
            }
            return String(val?.value);
        },
        tooltipValueGetter: (params) =>
            !params.data?.shouldAggregate ? 'This value is not summed up in total' : undefined,
        comparator: (
            valA: TArbStatsDailyColumnValueWithAggregation,
            valB: TArbStatsDailyColumnValueWithAggregation,
        ) => {
            if (valA && valB) {
                return valA.value - valB.value;
            }
            return 0;
        },
        aggFunc: EAggFuncs.SumExceptRootRow,
    },
    {
        field: 'volumeUsdToday',
        headerName: 'Volume $',
        valueGetter: (params) => ({
            value: params.data?.volumeUsdToday,
            shouldAggregate: params.data?.shouldAggregate,
        }),
        valueFormatter: (
            params: ValueFormatterParams<
                TArbStatsDailyAsset,
                TArbStatsDailyColumnValueWithAggregation
            >,
        ) => {
            const val = params.value;
            return formatUsdCompact(val?.value);
        },
        comparator: (
            valA: TArbStatsDailyColumnValueWithAggregation,
            valB: TArbStatsDailyColumnValueWithAggregation,
        ) => {
            if (valA && valB) {
                return valA.value - valB.value;
            }
            return 0;
        },
        aggFunc: EAggFuncs.SumExceptRootRow,
    },
    {
        field: 'lastTrade',
        valueFormatter: dateFormatter(timeZone, EDateTimeFormats.Time),
        tooltipValueGetter: (params) =>
            isNumber(params.data?.tradesToday) ? undefined : 'This value is not summed up in total',
        cellRenderer: createTimeTooltipRenderer(timeZone),
        aggFunc: EAggFuncs.Max,
    },
    createFeesColumn(),
    {
        colId: 'makerPercent',
        headerName: 'Maker %',
        valueGetter: valueGetters[EAggFuncs.MakerPercentage],
        valueFormatter: numberFormatter('%.1f%%'),
        aggFunc: EAggFuncs.MakerPercentage,
    },
    {
        colId: 'takerPercent',
        headerName: 'Taker %',
        valueGetter: valueGetters[EAggFuncs.TakerPercentage],
        valueFormatter: numberFormatter('%.1f%%'),
        aggFunc: EAggFuncs.TakerPercentage,
    },
    {
        field: 'makerVolumeUsd',
        headerName: 'Maker V',
        valueGetter: (params) => ({
            value: params.data?.makerVolumeUsd,
            shouldAggregate: params.data?.shouldAggregate,
        }),
        valueFormatter: (
            params: ValueFormatterParams<
                TArbStatsDailyAsset,
                TArbStatsDailyColumnValueWithAggregation
            >,
        ) => {
            const val = params.value;
            return formatUsd(val?.value);
        },
        comparator: (
            valA: TArbStatsDailyColumnValueWithAggregation,
            valB: TArbStatsDailyColumnValueWithAggregation,
        ) => {
            if (valA && valB) {
                return valA.value - valB.value;
            }
            return 0;
        },
        aggFunc: EAggFuncs.SumExceptRootRow,
    },
    {
        field: 'takerVolumeUsd',
        headerName: 'Taker V',
        valueGetter: (params) => ({
            value: params.data?.takerVolumeUsd,
            shouldAggregate: params.data?.shouldAggregate,
        }),
        valueFormatter: (
            params: ValueFormatterParams<
                TArbStatsDailyAsset,
                TArbStatsDailyColumnValueWithAggregation
            >,
        ) => {
            const val = params.value;
            return formatUsd(val?.value);
        },
        comparator: (
            valA: TArbStatsDailyColumnValueWithAggregation,
            valB: TArbStatsDailyColumnValueWithAggregation,
        ) => {
            if (valA && valB) {
                return valA.value - valB.value;
            }
            return 0;
        },
        aggFunc: EAggFuncs.SumExceptRootRow,
    },
];
