import type { TAsset } from '@backend/bff/src/modules/instruments/schemas/defs.ts';
import type { GetContextMenuItemsParams, MenuItemDef } from '@frontend/ag-grid';
import { EDefaultContextMenuItemName } from '@frontend/common/src/components/AgTable/hooks/useGetContextMenuItems.ts';
import { createContextMenuIcon } from '@frontend/common/src/utils/contextMenu/contextMenu';
import { useFunction } from '@frontend/common/src/utils/React/useFunction.ts';
import { isNil } from 'lodash-es';

const svgCheck = createContextMenuIcon(
    require('@ant-design/icons-svg/inline-svg/outlined/check.svg') as string,
);

export function useGetContextMenuItems({
    approveAsset,
}: {
    approveAsset: (asset: TAsset) => Promise<boolean>;
}) {
    return useFunction((params: GetContextMenuItemsParams<TAsset>): (string | MenuItemDef)[] => {
        const data = params.node?.data;
        const actions: (string | MenuItemDef)[] = [];

        if (isNil(data)) {
            return actions;
        }

        actions.push({
            icon: svgCheck,
            name: `Approve asset "${data.name}"`,
            disabled: data.approvalStatus !== 'ASSET_APPROVAL_STATUS_UNAPPROVED',
            action: () => approveAsset(data),
        });
        actions.push(EDefaultContextMenuItemName.Separator);

        return actions;
    });
}
