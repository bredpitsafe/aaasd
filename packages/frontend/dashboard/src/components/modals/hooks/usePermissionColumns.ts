import type { ColDef } from '@frontend/ag-grid';
import { AgValue } from '@frontend/ag-grid/src/AgValue';
import { EColumnFilterType } from '@frontend/ag-grid/src/types';
import { EStorageDashboardPermission } from '@frontend/common/src/types/domain/dashboardsStorage';
import { useMemo } from 'react';

import { PermissionsIcon, permissionsIconValueGetter } from '../components/PermissionsIcon';
import { UserWithAction, userWithActionValueGetter } from '../components/UserWithAction';
import type { TPermissionKey } from './defs';
import type { TPermissionItem } from './usePermissions';

export function usePermissionColumns(
    onChangePermission: (keys: TPermissionKey[], permission: EStorageDashboardPermission) => void,
    onDeleteUser: (key: TPermissionKey) => boolean,
): ColDef<TPermissionItem>[] {
    return useMemo<ColDef<TPermissionItem>[]>(
        () => [
            {
                field: 'key',
                hide: true,
                sort: 'asc',
            },
            {
                colId: 'user',
                filter: 'agTextColumnFilter',
                valueGetter: userWithActionValueGetter,
                cellRenderer: UserWithAction,
                floatingFilter: true,
                floatingFilterComponentParams: { suppressFilterButton: true },
                suppressMenu: true,
                resizable: false,
                cellRendererParams: { onDeleteUser },
            },
            {
                colId: 'permissions',
                headerName: '',
                equals: AgValue.isEqual,
                valueGetter: permissionsIconValueGetter,
                cellRenderer: PermissionsIcon,
                maxWidth: 108,
                resizable: false,
                filter: EColumnFilterType.set,
                floatingFilter: true,
                suppressMenu: true,
                cellRendererParams: { onChangePermission },
            },
        ],
        [onChangePermission, onDeleteUser],
    );
}
