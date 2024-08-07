import type { GetContextMenuItemsParams, GridOptions, MenuItemDef } from '@frontend/ag-grid';
import { EDefaultContextMenuItemName } from '@frontend/common/src/components/AgTable/hooks/useGetContextMenuItems';
import { EStorageDashboardPermission } from '@frontend/common/src/types/domain/dashboardsStorage';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import cn from 'classnames';

import { cnPermissionIcon, cnPermissionIconDisabled, cnPermissionIconSelected } from '../style.css';
import type { TPermissionKey } from './defs';
import type { TPermissionItem } from './usePermissions';

export function useGetPermissionsContextMenuItems(
    onChangePermission: (keys: TPermissionKey[], permission: EStorageDashboardPermission) => void,
): GridOptions<TPermissionItem>['getContextMenuItems'] {
    return useFunction(
        ({ node, api }: GetContextMenuItemsParams<TPermissionItem>): (string | MenuItemDef)[] => {
            const data = node?.data;
            const actions: (string | MenuItemDef)[] = [];

            if (data === undefined) {
                return actions;
            }

            const rows = api.getSelectedRows();
            const rowsToModify = rows.find(({ key }) => data.key === key) ? rows : [data];
            const bulkAction = (permission: EStorageDashboardPermission) =>
                onChangePermission(
                    rowsToModify.map(({ key }) => key),
                    permission,
                );
            const validPermissions = new Set(
                rowsToModify.map(({ possiblePermissions }) => possiblePermissions).flat(),
            );

            actions.push({
                name: `Permissions for ${
                    rowsToModify.length === 1
                        ? `user "${rowsToModify[0].user}"`
                        : `${rowsToModify.length} users`
                }`,
                subMenu: [
                    createPermissionContextMenuName(
                        EStorageDashboardPermission.Owner,
                        validPermissions,
                        bulkAction,
                    ),
                    createPermissionContextMenuName(
                        EStorageDashboardPermission.Editor,
                        validPermissions,
                        bulkAction,
                    ),
                    createPermissionContextMenuName(
                        EStorageDashboardPermission.Viewer,
                        validPermissions,
                        bulkAction,
                    ),
                    createPermissionContextMenuName(
                        EStorageDashboardPermission.None,
                        validPermissions,
                        bulkAction,
                    ),
                ],
            });

            actions.push(EDefaultContextMenuItemName.Separator);

            actions.push(EDefaultContextMenuItemName.Copy);
            actions.push(EDefaultContextMenuItemName.CopyWithHeaders);
            actions.push(EDefaultContextMenuItemName.CopyWithGroupHeaders);

            actions.push(EDefaultContextMenuItemName.Separator);

            actions.push(EDefaultContextMenuItemName.Export);

            return actions;
        },
    );
}

function createPermissionContextMenuName(
    permission: EStorageDashboardPermission,
    validPermissions: Set<string>,
    bulkAction: (permission: EStorageDashboardPermission) => void,
) {
    const disabled = !validPermissions.has(permission);

    return {
        name: `<span><span class="${cn(cnPermissionIcon, cnPermissionIconSelected[permission], {
            [cnPermissionIconDisabled]: disabled,
        })}">${permission.toUpperCase().substring(0, 1)}</span> ${permission}</span>`,
        action: bulkAction.bind(undefined, permission),
        disabled,
    };
}
