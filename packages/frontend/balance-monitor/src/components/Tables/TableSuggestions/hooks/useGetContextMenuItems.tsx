import type { GetContextMenuItemsParams, GridOptions, MenuItemDef } from '@frontend/ag-grid';
import { EDefaultContextMenuItemName } from '@frontend/common/src/components/AgTable/hooks/useGetContextMenuItems';
import type { TCoinId } from '@frontend/common/src/types/domain/balanceMonitor/defs';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';

import type { TManualTransferFormData } from '../../../Forms/ManualTransfer/defs';
import { svgClone } from '../../icons';
import type { TPlainSuggestion } from '../defs';

export function useGetContextMenuItems(
    onOpenManualTransferTab: (manualTransfer?: TManualTransferFormData) => void,
    onSaveCoinState: (coin: TCoinId, comment: string) => void,
): GridOptions<TPlainSuggestion>['getContextMenuItems'] {
    return useFunction(
        (params: GetContextMenuItemsParams<TPlainSuggestion>): (string | MenuItemDef)[] => {
            const data = params.node?.data;
            const actions: (string | MenuItemDef)[] = [];

            if (data === undefined) {
                return actions;
            }

            actions.push(
                {
                    icon: svgClone,
                    name: 'Fill Manual Transfer',
                    action: onOpenManualTransferTab.bind(undefined, {
                        coin: data.coin,
                        from: data.source,
                        to: data.destination,
                        amount: data.amount,
                        disableCoinSelection: true,
                    }),
                },
                {
                    name: `Send data to analyse ${data.coin}`,
                    action: onSaveCoinState.bind(
                        undefined,
                        data.coin,
                        'Requested to save coin state from Suggested Transfers',
                    ),
                },
            );

            actions.push(EDefaultContextMenuItemName.Separator);

            return actions;
        },
    );
}
