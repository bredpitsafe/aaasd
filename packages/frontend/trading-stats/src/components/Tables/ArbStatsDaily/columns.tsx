import type { ColDef, ValueGetterParams } from '@frontend/ag-grid';
import { dateFormatter } from '@frontend/common/src/components/AgTable/formatters/date';
import { numberFormatter } from '@frontend/common/src/components/AgTable/formatters/number';
import { usdFormatter } from '@frontend/common/src/components/AgTable/formatters/usd';
import { EDateTimeFormats, TimeZone } from '@frontend/common/src/types/time';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

import { createTimeTooltipRenderer } from '../BalancePnlDaily/renderers/TimeTooltipRenderer';
import { createFeesColumn } from './renderers/FeesRenderer';
import type { TArbStatsDailyAsset } from './types';
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
        rowGroup: true,
        hide: true,
    },
    {
        field: 'breakdown',
        rowGroup: true,
        hide: true,
    },
    {
        field: 'entityName',
        headerName: 'Exch./Asset',
    },
    {
        field: 'tradesToday',
        headerName: 'Trades',
        aggFunc: EAggFuncs.SumExceptRootRow,
    },
    {
        field: 'volumeUsdToday',
        headerName: 'Volume $',
        valueFormatter: usdFormatter(true),
        aggFunc: EAggFuncs.SumExceptRootRow,
    },
    {
        field: 'lastTrade',
        valueFormatter: dateFormatter(timeZone, EDateTimeFormats.Time),
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
        valueFormatter: usdFormatter(),
        aggFunc: EAggFuncs.SumExceptRootRow,
    },
    {
        field: 'takerVolumeUsd',
        headerName: 'Taker V',
        valueFormatter: usdFormatter(),
        aggFunc: EAggFuncs.SumExceptRootRow,
    },
];
