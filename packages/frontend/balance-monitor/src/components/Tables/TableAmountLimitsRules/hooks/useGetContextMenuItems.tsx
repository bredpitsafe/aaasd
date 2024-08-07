import type { GetContextMenuItemsParams, GridOptions, MenuItemDef } from '@frontend/ag-grid';
import { EDefaultContextMenuItemName } from '@frontend/common/src/components/AgTable/hooks/useGetContextMenuItems';
import type { TAmountLimitsRuleInfo } from '@frontend/common/src/types/domain/balanceMonitor/defs';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';

export function useGetContextMenuItems(
    onDeleteAmountLimitsRule: (transferBlockingRule: TAmountLimitsRuleInfo) => void,
    onEditAmountLimitsRule: (transferBlockingRule: TAmountLimitsRuleInfo) => void,
): GridOptions<TAmountLimitsRuleInfo>['getContextMenuItems'] {
    return useFunction(
        (params: GetContextMenuItemsParams<TAmountLimitsRuleInfo>): (string | MenuItemDef)[] => {
            const data = params.node?.data;
            const actions: (string | MenuItemDef)[] = [];

            if (data === undefined) {
                return actions;
            }

            actions.push(
                {
                    name: 'Edit Amount Limits Rule',
                    action: () => onEditAmountLimitsRule(data),
                },
                {
                    name: `Delete Amount Limits Rule`,
                    action: () => onDeleteAmountLimitsRule(data),
                },
            );

            actions.push(EDefaultContextMenuItemName.Separator);

            return actions;
        },
    );
}
