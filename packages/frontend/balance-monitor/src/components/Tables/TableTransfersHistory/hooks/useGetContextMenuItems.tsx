import type { GetContextMenuItemsParams, MenuItemDef } from '@frontend/ag-grid';
import { EDefaultContextMenuItemName } from '@frontend/common/src/components/AgTable/hooks/useGetContextMenuItems';
import type { TTransferHistoryItem } from '@frontend/common/src/types/domain/balanceMonitor/defs';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';

import type { TManualTransferFormData } from '../../../Forms/ManualTransfer/defs';
import { svgClone } from '../../icons';

export function useGetContextMenuItems(
    onOpenManualTransferTab: (manualTransfer?: TManualTransferFormData) => void,
) {
    return useFunction(
        (params: GetContextMenuItemsParams<TTransferHistoryItem>): (string | MenuItemDef)[] => {
            const data = params.node?.data;
            const actions: (string | MenuItemDef)[] = [];

            if (data === undefined) {
                return actions;
            }

            actions.push({
                icon: svgClone,
                name: 'Fill Manual Transfer',
                action: onOpenManualTransferTab.bind(undefined, {
                    coin: data.coin,
                    from: data.source.account,
                    to: data.destination.account,
                    amount: data.amount,
                    disableCoinSelection: true,
                    disableSourceSelection: true,
                    disableDestinationSelection: true,
                }),
            });

            actions.push(EDefaultContextMenuItemName.Separator);

            return actions;
        },
    );
}
