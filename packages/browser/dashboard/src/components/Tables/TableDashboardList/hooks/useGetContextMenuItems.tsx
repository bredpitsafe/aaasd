import { EDefaultContextMenuItemName } from '@frontend/common/src/components/AgTable/hooks/useGetContextMenuItems';
import { TStorageDashboardId } from '@frontend/common/src/types/domain/dashboardsStorage';
import { createContextMenuIcon } from '@frontend/common/src/utils/contextMenu/contextMenu';
import type { GetContextMenuItemsParams, GridOptions, MenuItemDef } from 'ag-grid-community';
import { isNil } from 'lodash-es';

import { TDashboardItem } from '../../../../types/fullDashboard';
import { isStorageDashboardItem } from '../../../../types/fullDashboard/guards';
import {
    hasDashboardOwnership,
    hasDraftDashboardItem,
    isReadonlyDashboardsStorageItem,
} from '../../../../utils/dashboards';

type TUseContextMenuItemsProps = {
    deleteDashboard: (dashboardItemKey: TDashboardItem) => Promise<void>;
    persistDashboard: (dashboardItemKey: TDashboardItem) => Promise<void>;
    revertDashboard: (dashboardItemKey: TDashboardItem) => Promise<void>;
    cloneDashboard: (dashboardItemKey: TDashboardItem) => Promise<void>;
    shareDashboard: (dashboardItemKey: TDashboardItem) => Promise<void>;
    copyDashboardURL: (dashboardItemKey: TDashboardItem) => Promise<void>;

    dashboardsUpdatingSet: ReadonlySet<TStorageDashboardId> | undefined;
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
            dashboardsUpdatingSet,
        } = props;

        const isUpdating =
            !isNil(dashboardsUpdatingSet) &&
            isStorageDashboardItem(dashboardItem) &&
            dashboardsUpdatingSet.has(dashboardItem.item.id);

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

        actions.push({
            name: 'Copy Dashboard URL',
            icon: svgCopy,
            action: () => void copyDashboardURL(dashboardItem),
        });

        return actions;
    };
}
