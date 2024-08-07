import type { TimeZone } from '@common/types';
import type { ColDef } from '@frontend/ag-grid';
import { EColumnFilterType } from '@frontend/ag-grid/src/types.ts';
import { numberFormatter } from '@frontend/common/src/components/AgTable/formatters/number';
import { usdFormatter } from '@frontend/common/src/components/AgTable/formatters/usd';
import { NumberColorizerRenderer } from '@frontend/common/src/components/AgTable/renderers/NumberColorizerRenderer';
import { EEntityKind } from '@frontend/common/src/types/domain/tradingStats';

import { BoolRenderer } from '../TradesTableFull/renderers/BoolRenderer';
import { ApproximateDeltaUsdRenderer } from './renderers/ApproximateDeltaUsdRenderer';
import { createTimeTooltipRenderer } from './renderers/TimeTooltipRenderer';
import type { TBalancePnlDailyAsset } from './types';
import { EAggFuncs } from './utils';

export const getColumns = (timeZone: TimeZone): ColDef<TBalancePnlDailyAsset>[] => [
    {
        field: 'strategy',
        headerName: 'Strategy',
        rowGroup: true,
        enableRowGroup: true,
        hide: true,
    },
    {
        field: 'entityKind',
        headerName: 'Kind',
        initialHide: true,
        enableRowGroup: true,
        filter: EColumnFilterType.set,
        filterParams: {
            values: Object.values(EEntityKind),
        },
    },
    {
        field: 'name',
        headerName: 'Name',
        enableRowGroup: true,
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
        headerTooltip: 'Долларовый эквивалент изменения баланса: (bal_now - bal_start) * rate_end',
    },
    {
        field: 'deltaUsd',
        headerName: 'Δ USD est.',
        headerTooltip: 'Долларовая переоценка баланса: bal_now * rate_now - bal_start * rate_start',
        aggFunc: EAggFuncs.SumExceptEmpty,
        equals: () => false,
        valueFormatter: usdFormatter(true),
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
        field: 'rateStart',
        headerTooltip: 'Рейт инструмента/ассета на начало суток, $',
        valueFormatter: numberFormatter('%.7g'),
        cellRendererSelector: (params) => ({
            params: {
                timestamp: params.data?.rateStartTimestamp,
            },
            component: createTimeTooltipRenderer(timeZone),
        }),
    },
    {
        field: 'rateEnd',
        headerTooltip: 'Текущий рейт или рейт инструмента/ассета на конец суток, $',
        valueFormatter: numberFormatter('%.7g'),
        cellRendererSelector: (params) => ({
            params: {
                timestamp: params.data?.rateEndTimestamp,
            },
            component: createTimeTooltipRenderer(timeZone),
        }),
    },
    {
        field: 'deltaRate',
        headerName: 'Δ Rate',
        headerTooltip: 'Изменение рейта инструмента/ассета с начала суток',
        valueFormatter: numberFormatter('%.6g'),
        cellRenderer: NumberColorizerRenderer,
    },
    {
        field: 'deltaRatePercent',
        headerName: 'Δ Rate %',
        headerTooltip: 'Процентное изменение рейта инструмента/ассета с начала суток',
        valueFormatter: numberFormatter('%.2f%%'),
        cellRenderer: NumberColorizerRenderer,
    },

    {
        field: 'priceStart',
        headerTooltip: 'Цена на начало суток',
        valueFormatter: numberFormatter('%.7g'),
        cellRendererSelector: (params) => ({
            params: {
                timestamp: params.data?.priceStartTimestamp,
            },
            component: createTimeTooltipRenderer(timeZone),
        }),
    },
    {
        field: 'priceEnd',
        headerTooltip: 'Текущая цена или цена на конец суток',
        valueFormatter: numberFormatter('%.7g'),
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
        headerTooltip: 'Изменение цены с начала суток',
        valueFormatter: numberFormatter('%.6g'),
        cellRenderer: NumberColorizerRenderer,
    },
    {
        field: 'deltaPricePercent',
        headerName: 'Δ Price %',
        headerTooltip: 'Процентное изменение цены с начала суток',
        valueFormatter: numberFormatter('%.2f%%'),
        cellRenderer: NumberColorizerRenderer,
    },
    {
        field: 'assetRateStart',
        headerTooltip: 'Рейт конвертации MV Asset в $ на начало суток',
        valueFormatter: numberFormatter('%.7g'),
        cellRendererSelector: (params) => ({
            params: {
                timestamp: params.data?.assetStartTimestamp,
            },
            component: createTimeTooltipRenderer(timeZone),
        }),
    },
    {
        field: 'assetRateEnd',
        headerTooltip: 'Текущий рейт или рейт конвертации MV Asset в $ на конец суток',
        valueFormatter: numberFormatter('%.7g'),
        cellRendererSelector: (params) => ({
            params: {
                timestamp: params.data?.assetEndTimestamp,
            },
            component: createTimeTooltipRenderer(timeZone),
        }),
    },

    {
        field: 'multiplier',
        headerTooltip: 'Множитель цены инструмента',
        valueFormatter: numberFormatter('%.7g'),
    },
    {
        field: 'mvAssetId',
        headerName: 'MV Asset ID',
        headerTooltip: 'Ассет в котором задана цена инструмента',
        initialHide: true,
    },
    {
        field: 'mvAssetName',
        headerName: 'MV Asset Name',
        headerTooltip: 'Имя ассета в котором задана цена инструмента',
    },
];
