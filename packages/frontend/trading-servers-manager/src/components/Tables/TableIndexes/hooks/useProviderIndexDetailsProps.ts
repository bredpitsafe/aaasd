import type { TIndex, TProviderIndex } from '@backend/bff/src/modules/instruments/schemas/defs.ts';
import type { TimeZone } from '@common/types';
import type { ColDef, GetDetailRowDataParams, GridOptions } from '@frontend/ag-grid';
import { getTimeColumn } from '@frontend/common/src/components/AgTable/columns/getTimeColumn.ts';
import {
    createDetailCellRendererContext,
    DetailCellRenderer,
} from '@frontend/common/src/components/AgTable/DetailCellRenderer.tsx';
import { ETableIds } from '@frontend/common/src/modules/clientTableFilters/data.ts';
import { isEmpty } from 'lodash-es';
import { useMemo } from 'react';

export function useProviderIndexDetailsProps(
    timeZone: TimeZone,
): Pick<
    GridOptions<TIndex>,
    | 'masterDetail'
    | 'detailCellRendererParams'
    | 'detailRowHeight'
    | 'detailRowAutoHeight'
    | 'isRowMaster'
> {
    const columns = useMemo<ColDef<TProviderIndex>[]>(
        () => [
            {
                field: 'name',
                headerName: 'Name',
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
            isRowMaster: (data: TIndex) => !isEmpty(data.providerIndexes),
            detailCellRenderer: DetailCellRenderer,
            detailCellRendererParams: {
                detailGridOptions: {
                    columnDefs: columns,
                    defaultColDef: { sortable: true, filter: false, resizable: true },
                    rowSelection: 'multiple',
                },
                getDetailRowData: (params: GetDetailRowDataParams<TIndex>) =>
                    params.successCallback(params.data.providerIndexes),
                suppressColumnVirtualisation: true,
                suppressRowVirtualisation: true,
                context: createDetailCellRendererContext(ETableIds.IndexesNested),
                domLayout: 'autoHeight',
            },
        }),
        [columns],
    );
}
