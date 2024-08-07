import type { TInstrument } from '@backend/bff/src/modules/instruments/schemas/defs.ts';
import type { MenuItemDef } from '@frontend/ag-grid';
import { EDefaultContextMenuItemName } from '@frontend/common/src/components/AgTable/hooks/useGetContextMenuItems.ts';
import { createContextMenuIcon } from '@frontend/common/src/utils/contextMenu/contextMenu';
import { useFunction } from '@frontend/common/src/utils/React/useFunction.ts';

import type { TFullInstrument } from '../../defs.ts';

const svgProfile = createContextMenuIcon(
    require('@ant-design/icons-svg/inline-svg/outlined/profile.svg') as string,
);

const svgBranches = createContextMenuIcon(
    require('@ant-design/icons-svg/inline-svg/outlined/branches.svg') as string,
);

export function useGetContextMenuItems({
    instruments,
    showProviderInstrumentsDetails,
    showInstrumentsRevisions,
}: {
    instruments: TFullInstrument[];
    showProviderInstrumentsDetails: (instruments: TInstrument[]) => Promise<boolean>;
    showInstrumentsRevisions: (instruments: TInstrument[]) => Promise<boolean>;
}) {
    return useFunction((): (string | MenuItemDef)[] => {
        const actions: (string | MenuItemDef)[] = [];

        if (instruments.length === 0) {
            return actions;
        }

        actions.push({
            icon: svgProfile,
            name:
                instruments.length > 1
                    ? `Show ${instruments.length} provider instruments details`
                    : `Show "${instruments[0].name}" provider instrument details`,
            disabled: instruments.length === 0,
            action: () => showProviderInstrumentsDetails(instruments),
        });

        actions.push({
            icon: svgBranches,
            name:
                instruments.length > 1
                    ? `Show ${instruments.length} instruments revisions`
                    : `Show "${instruments[0].name}" instrument revisions`,
            disabled: instruments.length === 0,
            action: () => showInstrumentsRevisions(instruments),
        });

        if (actions.length > 0) {
            actions.push(EDefaultContextMenuItemName.Separator);
        }

        return actions;
    });
}
