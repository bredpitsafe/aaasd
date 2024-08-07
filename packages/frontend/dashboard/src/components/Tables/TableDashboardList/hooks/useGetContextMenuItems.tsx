import type { Nil } from '@common/types';
import type { GetContextMenuItemsParams, GridOptions, MenuItemDef } from '@frontend/ag-grid';
import type { EDefaultContextMenuItemName } from '@frontend/common/src/components/AgTable/hooks/useGetContextMenuItems';
import type {
    TScope,
    TStorageDashboardId,
} from '@frontend/common/src/types/domain/dashboardsStorage';
import { EStorageDashboardPermission } from '@frontend/common/src/types/domain/dashboardsStorage';
import { createContextMenuIcon } from '@frontend/common/src/utils/contextMenu/contextMenu';
import { isEqual, isNil } from 'lodash-es';

import type { TDashboardItem, TStorageDashboardItem } from '../../../../types/fullDashboard';
import { isStorageDashboardItem } from '../../../../types/fullDashboard/guards';
import {
    hasDashboardOwnership,
    hasDraftDashboardItem,
    isReadonlyDashboardsStorageItem,
} from '../../../../utils/dashboards';

type TUseContextMenuItemsProps = {
    deleteDashboard: (dashboardItem: TDashboardItem) => Promise<unknown>;
    persistDashboard: (dashboardItem: TDashboardItem) => Promise<unknown>;
    revertDashboard: (dashboardItem: TDashboardItem) => Promise<unknown>;
    cloneDashboard: (dashboardItem: TDashboardItem) => Promise<unknown>;
    shareDashboard: (dashboardItem: TDashboardItem) => Promise<unknown>;
    copyDashboardURL: (dashboardItem: TDashboardItem) => Promise<unknown>;
    bindDashboardToCurrentScope: (dashboardItem: TStorageDashboardItem) => Promise<unknown>;
    unbindDashboardFromCurrentScope: (dashboardItem: TStorageDashboardItem) => Promise<unknown>;
    updatingStorageDashboardIds: Nil | TStorageDashboardId[];
    isScopedDashboardsRoute: boolean;
    currentScope: TScope | undefined;
};

type TParams = GetContextMenuItemsParams<TDashboardItem>;

const svgRename = createContextMenuIcon(
    require('@ant-design/icons-svg/inline-svg/outlined/edit.svg') as string,
);

const svgShare = createContextMenuIcon(
    require('@ant-design/icons-svg/inline-svg/outlined/cloud-upload.svg') as string,
);

const svgSave = createContextMenuIcon(
    require('@ant-design/icons-svg/inline-svg/outlined/save.svg') as string,
);

const svgRevert = createContextMenuIcon(
    require('@ant-design/icons-svg/inline-svg/outlined/undo.svg') as string,
);

const svgDelete = createContextMenuIcon(
    require('@ant-design/icons-svg/inline-svg/outlined/delete.svg') as string,
);

const svgClone = createContextMenuIcon(
    require('@ant-design/icons-svg/inline-svg/outlined/copy.svg') as string,
);

const svgCopy = createContextMenuIcon(
    require('@ant-design/icons-svg/inline-svg/outlined/snippets.svg') as string,
);

const svgBind = createContextMenuIcon(
    require('@ant-design/icons-svg/inline-svg/outlined/login.svg') as string,
);

const svgUnbind = createContextMenuIcon(
    require('@ant-design/icons-svg/inline-svg/outlined/logout.svg') as string,
);

export function useGetContextMenuItems(
    props: TUseContextMenuItemsProps,
): GridOptions<TDashboardItem>['getContextMenuItems'] {
    return createActionsFactory(props);
}

function createActionsFactory(props: TUseContextMenuItemsProps) {
    return function getActions(params: TParams): (EDefaultContextMenuItemName | MenuItemDef)[] {
        const dashboardItem = params.node?.data;
        const actions: (EDefaultContextMenuItemName | MenuItemDef)[] = [];

        if (dashboardItem === undefined) return actions;

        const {
            deleteDashboard,
            persistDashboard,
            revertDashboard,
            cloneDashboard,
            shareDashboard,
            copyDashboardURL,
            updatingStorageDashboardIds,
            bindDashboardToCurrentScope,
            unbindDashboardFromCurrentScope,
            isScopedDashboardsRoute,
            currentScope,
        } = props;

        const isUpdating =
            !isNil(updatingStorageDashboardIds) &&
            isStorageDashboardItem(dashboardItem) &&
            updatingStorageDashboardIds.includes(dashboardItem.item.id);

        const { canBePersisted, canBeReverted, canBeDeleted, canSharePermission } = (() => {
            const hasDraft = hasDraftDashboardItem(dashboardItem.item);

            if (!isStorageDashboardItem(dashboardItem)) {
                return {
                    canBePersisted: true,
                    canBeReverted: hasDraft,
                    canBeDeleted: false,
                    canSharePermission: false,
                };
            }

            return {
                canBePersisted: hasDraft || isReadonlyDashboardsStorageItem(dashboardItem.item),
                canBeReverted: hasDraft,
                canBeDeleted: true,
                canSharePermission: hasDashboardOwnership(dashboardItem.item),
            };
        })();

        if (isScopedDashboardsRoute && currentScope) {
            const scopedDashboardItem = dashboardItem as TStorageDashboardItem;
            const disabled =
                scopedDashboardItem.item.permission === EStorageDashboardPermission.Viewer;
            const tooltip = disabled
                ? 'Not enough permissions to modify scope binding for the current dashboard'
                : undefined;
            if (scopedDashboardItem.item.scopes.find((scope) => isEqual(scope, currentScope))) {
                actions.push({
                    name: 'Unbind Dashboard from the current scope',
                    icon: svgUnbind,
                    action: () => void unbindDashboardFromCurrentScope(scopedDashboardItem),
                    disabled,
                    tooltip,
                });
            } else {
                actions.push({
                    name: 'Bind Dashboard to the current scope',
                    icon: svgBind,
                    action: () => void bindDashboardToCurrentScope(scopedDashboardItem),
                    disabled,
                    tooltip,
                });
            }
        }

        actions.push({
            name: 'Copy Dashboard URL',
            icon: svgCopy,
            action: () => void copyDashboardURL(dashboardItem),
        });

        if (!isNil(params.node?.rowIndex)) {
            actions.push({
                name: 'Rename Dashboard',
                icon: svgRename,
                action: () => {
                    params.api.startEditingCell({
                        rowIndex: params.node!.rowIndex!,
                        colKey: 'name',
                    });
                },
            });
        }

        if (canSharePermission) {
            actions.push({
                name: 'Share Dashboard',
                icon: svgShare,
                disabled: isUpdating,
                action: () => shareDashboard(dashboardItem),
            });
        }

        if (canBePersisted) {
            actions.push({
                icon: svgSave,
                name: 'Save Dashboard',
                disabled: isUpdating,
                action: () => void persistDashboard(dashboardItem),
            });
        }

        if (canBeReverted) {
            actions.push({
                name: 'Revert Changes',
                icon: svgRevert,
                disabled: isUpdating,
                action: () => void revertDashboard(dashboardItem),
            });
        }

        if (canBeDeleted) {
            actions.push({
                name: 'Delete Dashboard',
                icon: svgDelete,
                disabled: isUpdating,
                action: () => void deleteDashboard(dashboardItem),
            });
        }

        actions.push({
            name: 'Clone Dashboard',
            icon: svgClone,
            action: () => void cloneDashboard(dashboardItem),
        });

        return actions;
    };
}
