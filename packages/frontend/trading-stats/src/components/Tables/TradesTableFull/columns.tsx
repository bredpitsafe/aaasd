import type { TimeZone } from '@common/types';
import type { ColDef } from '@frontend/ag-grid';
import { createColumnIsoRangeFilterData } from '@frontend/common/src/components/AgTable/columns/ColumnIsoRangeFilter';
import { SideRenderer } from '@frontend/common/src/components/AgTable/renderers/SideRenderer';
import { isoGetter } from '@frontend/common/src/components/AgTable/valueGetters/iso';
import type { TOwnTrade } from '@frontend/common/src/types/domain/ownTrades';
import { ETradingStatsTimeFormat } from '@frontend/common/src/types/domain/tradingStats';

import { Time } from '../components/Time';
import { BoolRenderer } from './renderers/BoolRenderer';

export const getColumns = (timeZone: TimeZone): ColDef<TOwnTrade>[] => [
    {
        field: 'platformTime',
        headerName: 'Platform Time',
        filter: createColumnIsoRangeFilterData<TOwnTrade>((params) => params.data.platformTime),
        valueGetter: isoGetter(),
        cellRendererSelector: (params) => ({
            params: {
                timestamp: params.value,
                timeZone,
                format: ETradingStatsTimeFormat.DateTimeSSS,
            },
            component: Time,
        }),
    },
    {
        field: 'exchangeTime',
        headerName: 'Exchange Time',
        filter: false,
        valueGetter: isoGetter(),
        cellRendererSelector: (params) => ({
            params: {
                timestamp: params.value,
                timeZone,
                format: ETradingStatsTimeFormat.DateTimeSSS,
            },
            component: Time,
        }),
    },
    {
        field: 'strategy',
        headerName: 'Strategy',
        filter: false,
    },
    {
        field: 'robotName',
        headerName: 'Robot',
        filter: false,
    },
    {
        field: 'exchangeName',
        headerName: 'Exch.',
        filter: false,
    },
    {
        field: 'gateName',
        headerName: 'Gate',
        filter: false,
    },
    {
        field: 'virtualAccountName',
        headerName: 'Virt. Acc',
        filter: false,
    },
    {
        field: 'accountName',
        headerName: 'Account',
        filter: false,
    },
    {
        field: 'instrumentName',
        headerName: 'Instr.',
        filter: false,
    },
    {
        field: 'role',
        headerName: 'Role',
        filter: false,
    },
    {
        field: 'side',
        headerName: 'Side',
        cellRendererSelector: (params) => ({
            params: {
                side: params.data?.side,
            },
            component: SideRenderer,
        }),
        filter: false,
    },
    {
        field: 'price',
        headerName: 'Price',
        filter: false,
    },
    {
        field: 'baseAmount',
        headerName: 'Base Amt.',
        filter: false,
    },
    {
        field: 'baseAssetName',
        headerName: 'Base Asset',
        filter: false,
    },
    {
        field: 'volumeAmount',
        headerName: 'Volume Amt.',
        filter: false,
    },
    {
        field: 'volumeAssetName',
        headerName: 'Volume Asset',
        filter: false,
    },
    {
        field: 'feeAmount',
        headerName: 'Fee Amt.',
        filter: false,
    },
    {
        field: 'feeAssetName',
        headerName: 'Fee Asset',
        filter: false,
    },
    {
        field: 'orderTag',
        headerName: 'Order Tag',
        filter: false,
    },
    {
        field: 'tradeId',
        headerName: 'Trade ID',
        filter: false,
    },
    {
        field: 'isLateTrade',
        headerName: 'Late',
        cellRenderer: BoolRenderer,
        filter: false,
    },
    {
        field: 'isFeeEvaluated',
        headerName: 'Fee Eval.',
        cellRenderer: BoolRenderer,
        filter: false,
    },
];
