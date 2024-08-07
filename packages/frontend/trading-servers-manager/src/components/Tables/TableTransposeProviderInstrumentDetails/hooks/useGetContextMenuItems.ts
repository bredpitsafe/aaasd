import type { TInstrument } from '@backend/bff/src/modules/instruments/schemas/defs.ts';
import type { MenuItemDef } from '@frontend/ag-grid';
import { EDefaultContextMenuItemName } from '@frontend/common/src/components/AgTable/hooks/useGetContextMenuItems.ts';
import { createContextMenuIcon } from '@frontend/common/src/utils/contextMenu/contextMenu';
import { useFunction } from '@frontend/common/src/utils/React/useFunction.ts';

const svgBranches = createContextMenuIcon(
    require('@ant-design/icons-svg/inline-svg/outlined/branches.svg') as string,
);

export function useGetContextMenuItems({
    instruments,
    showProviderInstrumentsRevisions,
}: {
    instruments: TInstrument[];
    showProviderInstrumentsRevisions: (instruments: TInstrument[]) => Promise<boolean>;
}) {
    return useFunction((): (string | MenuItemDef)[] => {
        const actions: (string | MenuItemDef)[] = [];

        if (instruments.length === 0) {
            return actions;
        }

        actions.push({
            icon: svgBranches,
            name:
                instruments.length > 1
                    ? `Show ${instruments.length} provider instruments revisions`
                    : `Show "${instruments[0].name}" provider instrument revisions`,
            disabled: instruments.length === 0,
            action: () => showProviderInstrumentsRevisions(instruments),
        });

        if (actions.length > 0) {
            actions.push(EDefaultContextMenuItemName.Separator);
        }

        return actions;
    });
}
