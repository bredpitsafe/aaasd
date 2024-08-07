import type { GetContextMenuItemsParams, GridOptions, MenuItemDef } from '@frontend/ag-grid';
import { EDefaultContextMenuItemName } from '@frontend/common/src/components/AgTable/hooks/useGetContextMenuItems';
import type { TInternalTransfer } from '@frontend/common/src/types/domain/balanceMonitor/defs';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';

import type { TInternalTransferFormProps } from '../../../Forms/InternalTransfers/defs';
import { svgClone } from '../../icons';

export function useGetContextMenuItems(
    onOpenInternalTransferTab: (internalTransfer?: TInternalTransferFormProps) => void,
): GridOptions<TInternalTransfer>['getContextMenuItems'] {
    return useFunction(
        (params: GetContextMenuItemsParams<TInternalTransfer>): (string | MenuItemDef)[] => {
            const data = params.node?.data;
            const actions: (string | MenuItemDef)[] = [];

            if (data === undefined) {
                return actions;
            }

            actions.push({
                icon: svgClone,
                name: 'Fill Internal Transfer',
                action: onOpenInternalTransferTab.bind(undefined, {
                    mainAccount: data.mainAccount.account,
                    fromSubAccount: data.source.name,
                    fromSection: data.source.section,
                    toSubAccount: data.destination.name,
                    toSection: data.destination.section,
                    coin: data.coin,
                    amount: data.amount,
                }),
            });

            actions.push(EDefaultContextMenuItemName.Separator);

            return actions;
        },
    );
}
