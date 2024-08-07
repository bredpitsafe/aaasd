import type { ColDef, IDetailCellRendererParams } from '@frontend/ag-grid';
import { EColumnFilterType } from '@frontend/ag-grid/src/types';
import { createDetailCellRendererContext } from '@frontend/common/src/components/AgTable/DetailCellRenderer';
import type { ETableIds } from '@frontend/common/src/modules/clientTableFilters/data';
import type { TRealAccount, TVirtualAccount } from '@frontend/common/src/types/domain/account';
import { useMemo } from 'react';

import { getAccountsRowClassRules } from './utils';

const rowClassRules = getAccountsRowClassRules<TRealAccount>();

export function useDetailCellRendererParams(
    id: ETableIds,
    onEditReal: (id?: TRealAccount['id']) => void,
): IDetailCellRendererParams<TVirtualAccount> {
    const columnDefs: ColDef<TRealAccount>[] = useMemo(
        () => [
            {
                field: 'id',
                headerName: 'ID',
                filter: EColumnFilterType.number,
                sort: 'asc',
            },
            {
                field: 'name',
                headerName: 'Name',
                onCellDoubleClicked: (e) => {
                    onEditReal(e.data?.id);
                },
            },
        ],
        [onEditReal],
    );

    return {
        detailGridOptions: {
            getRowId: (params) => params.data.id,
            columnDefs,
            rowClassRules,
        },
        getDetailRowData: (params) => {
            params.successCallback(params.data.realAccounts);
        },
        context: createDetailCellRendererContext(id),
    } as IDetailCellRendererParams<TVirtualAccount>;
}
