import type { ColDef, IDetailCellRendererParams } from '@frontend/ag-grid';
import { BOOLEAN_FILTER_VALUES } from '@frontend/ag-grid/src/filters';
import { EColumnFilterType } from '@frontend/ag-grid/src/types.ts';
import { createDetailCellRendererContext } from '@frontend/common/src/components/AgTable/DetailCellRenderer';
import type { ETableIds } from '@frontend/common/src/modules/clientTableFilters/data';
import type { TAccountCredentials, TRealAccount } from '@frontend/common/src/types/domain/account';

import { getAccountsRowClassRules } from '../TableVirtualAccounts/utils';

const columnDefs: ColDef<TAccountCredentials>[] = [
    {
        field: 'name',
        sort: 'asc',
    },
    {
        field: 'key',
    },
    {
        field: 'secret',
    },
    {
        field: 'passphrase',
    },
    {
        field: 'isInternal',
        headerName: 'Internal',
        filter: EColumnFilterType.set,
        filterParams: {
            ...BOOLEAN_FILTER_VALUES,
        },
    },
];

const rowClassRules = getAccountsRowClassRules<TRealAccount>();

export function useDetailCellRendererParams(
    id: ETableIds,
): IDetailCellRendererParams<TRealAccount> {
    return {
        detailGridOptions: {
            getRowId: (params) => params.data.id,
            columnDefs,
            rowClassRules,
        },
        getDetailRowData: (params) => {
            params.successCallback(params.data.credentials);
        },
        context: createDetailCellRendererContext(id),
    } as IDetailCellRendererParams<TRealAccount>;
}
