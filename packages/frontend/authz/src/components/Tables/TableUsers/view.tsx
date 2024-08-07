import type { Nil } from '@common/types';
import type { ColDef } from '@frontend/ag-grid';
import { AgTableWithRouterSync } from '@frontend/common/src/components/AgTable/AgTableWithRouterSync.tsx';
import { useGridApi } from '@frontend/common/src/components/AgTable/hooks/useGridApi.ts';
import { ETableIds } from '@frontend/common/src/modules/clientTableFilters/data.ts';
import type { ReactElement } from 'react';

import { getRowHeight, useColumns } from './columns.tsx';
import type { TTableUsersItem } from './def.ts';

const DEFAULT_COL_DEF: ColDef = {
    minWidth: 150,
    floatingFilter: true,
    flex: 1,
};

export function TableUsers(props: {
    items: Nil | TTableUsersItem[];
    isLoading: boolean;
}): ReactElement {
    const columns = useColumns();
    const { onGridReady } = useGridApi<TTableUsersItem>();

    return (
        <AgTableWithRouterSync
            id={ETableIds.AuthzUsers}
            getRowId={(params) => params.data.user.name}
            rowData={props.items}
            getRowHeight={getRowHeight}
            columnDefs={columns}
            defaultColDef={DEFAULT_COL_DEF}
            onGridReady={onGridReady}
        />
    );
}
