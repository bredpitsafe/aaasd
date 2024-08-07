import type { ColDef } from '@frontend/ag-grid';
import { AgValue } from '@frontend/ag-grid/src/AgValue';
import { FLOATING_SET_FILTER, FLOATING_TEXT_FILTER } from '@frontend/ag-grid/src/filters';
import { EStorageDashboardPermission } from '@frontend/common/src/types/domain/dashboardsStorage';
import { useMemo } from 'react';

import { PermissionsIcon, permissionsIconValueGetter } from '../components/PermissionsIcon';
import type { TPermissionKey } from './defs';
import type { TPermissionItem } from './usePermissions';

export function usePermissionColumns(
    onChangePermission: (keys: TPermissionKey[], permission: EStorageDashboardPermission) => void,
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
                headerName: 'User',
                field: 'user.displayName',
                ...FLOATING_TEXT_FILTER,
                suppressMenu: true,
                resizable: false,
            },
            {
                colId: 'nickname',
                headerName: 'Nickname',
                field: 'user.name',
                ...FLOATING_TEXT_FILTER,
                suppressMenu: true,
                resizable: false,
            },
            {
                colId: 'permissions',
                headerName: 'Permissions',
                equals: AgValue.isEqual,
                valueGetter: permissionsIconValueGetter,
                cellRenderer: PermissionsIcon,
                maxWidth: 108,
                resizable: false,
                filterParams: {
                    values: [
                        EStorageDashboardPermission.None,
                        EStorageDashboardPermission.Viewer,
                        EStorageDashboardPermission.Editor,
                        EStorageDashboardPermission.Owner,
                    ],
                },
                ...FLOATING_SET_FILTER,
                suppressMenu: true,
                cellRendererParams: { onChangePermission },
            },
        ],
        [onChangePermission],
    );
}
