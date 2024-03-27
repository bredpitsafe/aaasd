import type { GetContextMenuItemsParams, GridOptions, MenuItemDef } from '@frontend/ag-grid';
import { EDefaultContextMenuItemName } from '@frontend/common/src/components/AgTable/hooks/useGetContextMenuItems';
import type { TAutoTransferRuleInfo } from '@frontend/common/src/types/domain/balanceMonitor/defs';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';

export function useGetContextMenuItems(
    onDeleteAutoTransferRule: (autoTransferRule: TAutoTransferRuleInfo) => void,
    onEditAutoTransferRule: (autoTransferRule: TAutoTransferRuleInfo) => void,
): GridOptions<TAutoTransferRuleInfo>['getContextMenuItems'] {
    return useFunction(
        (params: GetContextMenuItemsParams<TAutoTransferRuleInfo>): (string | MenuItemDef)[] => {
            const data = params.node?.data;
            const actions: (string | MenuItemDef)[] = [];

            if (data === undefined) {
                return actions;
            }

            actions.push(
                {
                    name: 'Edit Auto Transfer Rule',
                    action: () => onEditAutoTransferRule(data),
                },
                {
                    name: `Delete Auto Transfer Rule`,
                    action: () => onDeleteAutoTransferRule(data),
                },
            );

            actions.push(EDefaultContextMenuItemName.Separator);

            return actions;
        },
    );
}
