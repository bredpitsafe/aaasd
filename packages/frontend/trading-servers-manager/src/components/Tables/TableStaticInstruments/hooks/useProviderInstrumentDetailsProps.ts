import type {
    TInstrument,
    TProviderInstrument,
} from '@backend/bff/src/modules/instruments/schemas/defs.ts';
import type { Assign, TimeZone } from '@common/types';
import type {
    AgGridCommon,
    ColDef,
    GetDetailRowDataParams,
    GridOptions,
    ICellRendererParams,
    IDetailCellRendererParams,
} from '@frontend/ag-grid';
import { getTimeColumn } from '@frontend/common/src/components/AgTable/columns/getTimeColumn.ts';
import {
    createDetailCellRendererContext,
    DetailCellRenderer,
} from '@frontend/common/src/components/AgTable/DetailCellRenderer.tsx';
import { UrlRenderer } from '@frontend/common/src/components/AgTable/renderers/UrlRenderer.tsx';
import { ETableIds } from '@frontend/common/src/modules/clientTableFilters/data.ts';
import { getExchangeLinkByName } from '@frontend/common/src/utils/exchangeLinks/getExchangeLinkByName.ts';
import { isEmpty, isNil } from 'lodash-es';
import { useMemo } from 'react';

import { ProviderInstrumentKindRenderer } from '../ProviderInstrumentKindRenderer.tsx';
import { ProviderSourceRenderer } from '../ProviderSourceRenderer.tsx';

export function useProviderInstrumentDetailsProps(
    timeZone: TimeZone,
): Pick<
    GridOptions<TInstrument>,
    | 'masterDetail'
    | 'detailCellRendererParams'
    | 'detailRowHeight'
    | 'detailRowAutoHeight'
    | 'isRowMaster'
> {
    const columns = useMemo<ColDef<TProviderInstrument>[]>(
        () => [
            {
                field: 'name',
                headerName: 'Name',
                cellRendererSelector: (
                    params: Assign<
                        ICellRendererParams<string, TProviderInstrument>,
                        AgGridCommon<TProviderInstrument, { parentData: TInstrument | undefined }>
                    >,
                ) => ({
                    params: {
                        url:
                            isNil(params.data) || isNil(params.context?.parentData?.exchange)
                                ? undefined
                                : getExchangeLinkByName({
                                      ...params.data,
                                      exchange: params.context.parentData.exchange,
                                  })?.href,
                        text: params.data?.name,
                    },
                    component: UrlRenderer,
                }),
            },
            {
                field: 'details.kind.type',
                headerName: 'Kind',
                cellRenderer: ProviderInstrumentKindRenderer,
            },
            {
                field: 'source',
                headerName: 'Source',
                cellRenderer: ProviderSourceRenderer,
            },
            {
                field: 'provider',
                headerName: 'Provider',
            },
            getTimeColumn('platformTime', 'Platform Time', timeZone),
        ],
        [timeZone],
    );

    return useMemo(
        () => ({
            masterDetail: true,
            detailRowAutoHeight: true,
            embedFullWidthRows: true,
            isRowMaster: (data: TInstrument) => !isEmpty(data.providerInstruments),
            detailCellRenderer: DetailCellRenderer,
            detailCellRendererParams: (params: IDetailCellRendererParams<TInstrument>) => ({
                detailGridOptions: {
                    columnDefs: columns,
                    defaultColDef: { sortable: true, filter: false, resizable: true },
                    context: { parentData: params.data },
                    rowSelection: 'multiple',
                },
                getDetailRowData: (params: GetDetailRowDataParams<TInstrument>) =>
                    params.successCallback(params.data.providerInstruments),
                suppressColumnVirtualisation: true,
                suppressRowVirtualisation: true,
                context: createDetailCellRendererContext(ETableIds.InstrumentsStaticDataNested),
                domLayout: 'autoHeight',
            }),
        }),
        [columns],
    );
}
