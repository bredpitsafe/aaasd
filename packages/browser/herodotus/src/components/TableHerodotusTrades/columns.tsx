import { dateFormatter } from '@frontend/common/src/components/AgTable/formatters/date';
import { EColumnFilterType } from '@frontend/common/src/components/AgTable/types';
import { isoGetter } from '@frontend/common/src/components/AgTable/valueGetters/iso';
import { EDateTimeFormats, TimeZone } from '@frontend/common/src/types/time';
import { ColDef } from 'ag-grid-community';
import { useMemo } from 'react';

import { THerodotusTrade } from '../../types/domain';
import { TradeRoleRenderer } from './renderers/TradeRoleRenderer';

export // Correct order:
// Platform time, Exchange time,
// Instrument, Market,
// Base, Quote, Type,
// Price, Base Amount, Quote Amount,
// Fee, Fee Amount, Id
function useColumns(timeZone: TimeZone): ColDef<THerodotusTrade>[] {
    return useMemo<ColDef<THerodotusTrade>[]>(
        () => [
            {
                field: 'platformTime',
                headerName: 'Platform time',
                valueGetter: isoGetter(),
                valueFormatter: dateFormatter(timeZone, EDateTimeFormats.DateTimeMilliseconds),
                sort: 'desc',
                filter: EColumnFilterType.date,
            },
            {
                field: 'exchangeTime',
                headerName: 'Exchange Time',
                valueGetter: isoGetter(),
                valueFormatter: dateFormatter(timeZone, EDateTimeFormats.DateTimeMilliseconds),
                filter: EColumnFilterType.date,
            },
            {
                headerName: 'Instrument',
                valueGetter: (params) => params.data?.instrument.split('|')[0],
            },
            {
                headerName: 'Market',
                valueGetter: (params) => params.data?.instrument.split('|')[1],
            },
            {
                field: 'baseAsset',
                headerName: 'Base',
            },
            {
                field: 'quoteAsset',
                headerName: 'Quote',
            },
            {
                field: 'type',
                headerName: 'Type',
                filter: EColumnFilterType.set,
            },
            {
                field: 'role',
                headerName: 'Role',
                cellRendererSelector: (params) => ({
                    params: {
                        role: params.data?.role,
                    },
                    component: TradeRoleRenderer,
                }),
                filter: EColumnFilterType.set,
            },
            {
                field: 'price',
                headerName: 'Price',
                filter: EColumnFilterType.number,
            },
            {
                field: 'baseAmount',
                headerName: 'Size',
                filter: EColumnFilterType.number,
            },
            {
                field: 'quoteAmount',
                headerName: 'Volume',
                filter: EColumnFilterType.number,
            },
            {
                field: 'feeAsset',
                headerName: 'Fee',
                filter: EColumnFilterType.number,
            },
            {
                field: 'feeAmount',
                headerName: 'Fee amount',
                filter: EColumnFilterType.number,
            },
            {
                field: 'id',
                headerName: 'ID',
                filter: EColumnFilterType.number,
            },
        ],
        [timeZone],
    );
}
