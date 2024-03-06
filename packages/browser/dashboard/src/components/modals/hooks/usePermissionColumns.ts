import { EColumnFilterType } from '@frontend/common/src/components/AgTable/types';
import { EStorageDashboardPermission } from '@frontend/common/src/types/domain/dashboardsStorage';
import type { ColDef } from 'ag-grid-community';
import { useMemo } from 'react';

import { PermissionsIcon } from '../components/PermissionsIcon';
import { UserWithAction } from '../components/UserWithAction';
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
                field: 'user',
                filter: 'agTextColumnFilter',
                cellRenderer: UserWithAction,
                floatingFilter: true,
                floatingFilterComponentParams: { suppressFilterButton: true },
                suppressMenu: true,
                resizable: false,
                cellRendererParams: { onDeleteUser },
            },
            {
                field: 'permission',
                headerName: '',
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
