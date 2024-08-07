import type { TAsset, TProviderAsset } from '@backend/bff/src/modules/instruments/schemas/defs.ts';
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

export function useProviderAssetDetailsProps(
    timeZone: TimeZone,
): Pick<
    GridOptions<TAsset>,
    | 'masterDetail'
    | 'detailCellRendererParams'
    | 'detailRowHeight'
    | 'detailRowAutoHeight'
    | 'isRowMaster'
> {
    const columns = useMemo<ColDef<TProviderAsset>[]>(
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
            isRowMaster: (data: TAsset) => !isEmpty(data.providerAssets),
            detailCellRenderer: DetailCellRenderer,
            detailCellRendererParams: {
                detailGridOptions: {
                    columnDefs: columns,
                    defaultColDef: { sortable: true, filter: false, resizable: true },
                    rowSelection: 'multiple',
                },
                getDetailRowData: (params: GetDetailRowDataParams<TAsset>) =>
                    params.successCallback(params.data.providerAssets),
                suppressColumnVirtualisation: true,
                suppressRowVirtualisation: true,
                context: createDetailCellRendererContext(ETableIds.AssetsNested),
                domLayout: 'autoHeight',
            },
        }),
        [columns],
    );
}
