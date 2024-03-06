import { numberFormatter } from '@frontend/common/src/components/AgTable/formatters/number';
import { usdFormatter } from '@frontend/common/src/components/AgTable/formatters/usd';
import { NumberColorizerRenderer } from '@frontend/common/src/components/AgTable/renderers/NumberColorizerRenderer';
import type { TimeZone } from '@frontend/common/src/types/time';
import type { ColDef } from 'ag-grid-community';

import { BoolRenderer } from '../TradesTableFull/renderers/BoolRenderer';
import { ApproximateDeltaUsdRenderer } from './renderers/ApproximateDeltaUsdRenderer';
import { createTimeTooltipRenderer } from './renderers/TimeTooltipRenderer';
import type { TBalancePnlDailyAsset } from './types';
import { EAggFuncs } from './utils';

export const getColumns = (timeZone: TimeZone): ColDef<TBalancePnlDailyAsset>[] => [
    {
        field: 'strategy',
        rowGroup: true,
        hide: true,
        lockVisible: true,
        suppressColumnsToolPanel: true,
    },
    {
        field: 'name',
    },
    {
        field: 'balanceStart',
        headerName: 'Bal. Start',
        valueFormatter: numberFormatter('%.9g'),
        headerTooltip: 'Баланс на начало суток',
    },
    {
        field: 'balanceEnd',
        headerName: 'Bal. Now/End',
        valueFormatter: numberFormatter('%.9g'),
        headerTooltip: 'Текущий баланс или баланс на конец суток',
    },
    {
        field: 'deltaBalance',
        headerName: 'Δ Balance',
        valueFormatter: numberFormatter('%.7g'),
        cellRenderer: NumberColorizerRenderer,
    },
    {
        field: 'deltaBalanceUsd',
        headerName: 'Δ Bal ($ equiv.)',
        valueFormatter: usdFormatter(true),
        cellRenderer: NumberColorizerRenderer,
        headerTooltip: 'Долларовый эквивалент изменения баланса: (bal_now - bal_start) * price_end',
    },
    {
        field: 'deltaUsd',
        headerName: 'Δ USD est.',
        valueFormatter: usdFormatter(true),
        headerTooltip:
            'Долларовая переоценка баланса: bal_now * price_now - bal_start * price_start',
        aggFunc: EAggFuncs.SumExceptEmpty,
        cellRenderer: ApproximateDeltaUsdRenderer,
    },
    {
        field: 'isDeltaUsdApproximate',
        headerName: 'Δ USD approx.',
        aggFunc: EAggFuncs.IsDeltaUsdApproximate,
        hide: true,
        cellRenderer: BoolRenderer,
        filter: 'agSetColumnFilter',
    },
    {
        field: 'priceStart',
        valueFormatter: numberFormatter('%.7g'),
        headerTooltip: 'Цена на начало суток',
        cellRendererSelector: (params) => ({
            params: {
                timestamp: params.data?.priceStartTimestamp,
            },
            component: createTimeTooltipRenderer(timeZone),
        }),
    },
    {
        field: 'priceEnd',
        valueFormatter: numberFormatter('%.7g'),
        headerTooltip: 'Текущая цена или цена на конец суток',
        cellRendererSelector: (params) => ({
            params: {
                timestamp: params.data?.priceEndTimestamp,
            },
            component: createTimeTooltipRenderer(timeZone),
        }),
    },
    {
        field: 'deltaPrice',
        headerName: 'Δ Price',
        valueFormatter: numberFormatter('%.6g'),
        cellRenderer: NumberColorizerRenderer,
        headerTooltip: 'Изменение цены с начала суток',
    },
    {
        field: 'deltaPricePercent',
        headerName: 'Δ Price %',
        valueFormatter: numberFormatter('%.2f%%'),
        cellRenderer: NumberColorizerRenderer,
        headerTooltip: 'Процентное изменение цены с начала суток',
    },
];
