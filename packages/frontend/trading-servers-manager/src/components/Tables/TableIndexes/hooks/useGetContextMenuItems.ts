import type { TIndex } from '@backend/bff/src/modules/instruments/schemas/defs.ts';
import type { GetContextMenuItemsParams, MenuItemDef } from '@frontend/ag-grid';
import { EDefaultContextMenuItemName } from '@frontend/common/src/components/AgTable/hooks/useGetContextMenuItems.ts';
import { createContextMenuIcon } from '@frontend/common/src/utils/contextMenu/contextMenu';
import { useFunction } from '@frontend/common/src/utils/React/useFunction.ts';
import { isNil } from 'lodash-es';

const svgCheck = createContextMenuIcon(
    require('@ant-design/icons-svg/inline-svg/outlined/check.svg') as string,
);

export function useGetContextMenuItems({
    approveIndex,
}: {
    approveIndex: (index: TIndex) => Promise<boolean>;
}) {
    return useFunction((params: GetContextMenuItemsParams<TIndex>): (string | MenuItemDef)[] => {
        const data = params.node?.data;
        const actions: (string | MenuItemDef)[] = [];

        if (isNil(data)) {
            return actions;
        }

        actions.push({
            icon: svgCheck,
            name: `Approve index "${data.name}"`,
            disabled: data.approvalStatus !== 'INDEX_APPROVAL_STATUS_UNAPPROVED',
            action: () => approveIndex(data),
        });
        actions.push(EDefaultContextMenuItemName.Separator);

        return actions;
    });
}
