import type { GetContextMenuItemsParams, GridOptions, MenuItemDef } from '@frontend/ag-grid';
import { EDefaultContextMenuItemName } from '@frontend/common/src/components/AgTable/hooks/useGetContextMenuItems';
import type { TTransferBlockingRuleInfo } from '@frontend/common/src/types/domain/balanceMonitor/defs';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
export function useGetContextMenuItems(
    onDeleteTransferBlockingRule: (transferBlockingRule: TTransferBlockingRuleInfo) => void,
    onEditTransferBlockingRule: (transferBlockingRule: TTransferBlockingRuleInfo) => void,
): GridOptions<TTransferBlockingRuleInfo>['getContextMenuItems'] {
    return useFunction(
        (
            params: GetContextMenuItemsParams<TTransferBlockingRuleInfo>,
        ): (string | MenuItemDef)[] => {
            const data = params.node?.data;
            const actions: (string | MenuItemDef)[] = [];

            if (data === undefined) {
                return actions;
            }

            actions.push(
                {
                    name: 'Edit Transfer Blocking Rule',
                    action: () => onEditTransferBlockingRule(data),
                },
                {
                    name: `Delete Transfer Blocking Rule`,
                    action: () => onDeleteTransferBlockingRule(data),
                },
            );

            actions.push(EDefaultContextMenuItemName.Separator);

            return actions;
        },
    );
}
