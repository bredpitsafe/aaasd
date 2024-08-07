import type {
    TInstrument,
    TInstrumentDynamicData,
} from '@backend/bff/src/modules/instruments/schemas/defs.ts';
import type { GetContextMenuItemsParams, MenuItemDef } from '@frontend/ag-grid';
import { getSelectedRowsWithOrder } from '@frontend/ag-grid/src/utils.ts';
import { EDefaultContextMenuItemName } from '@frontend/common/src/components/AgTable/hooks/useGetContextMenuItems.ts';
import { createContextMenuIcon } from '@frontend/common/src/utils/contextMenu/contextMenu';
import { statusToDisplayStatus } from '@frontend/common/src/utils/instruments/converters.ts';
import { useFunction } from '@frontend/common/src/utils/React/useFunction.ts';
import { isNil } from 'lodash-es';

const svgCheck = createContextMenuIcon(
    require('@ant-design/icons-svg/inline-svg/outlined/check.svg') as string,
);

const svgProfile = createContextMenuIcon(
    require('@ant-design/icons-svg/inline-svg/outlined/profile.svg') as string,
);

const svgBranches = createContextMenuIcon(
    require('@ant-design/icons-svg/inline-svg/outlined/branches.svg') as string,
);

export function useGetInstrumentsListContextMenuItems({
    approveInstruments,
    showInstrumentsDetails,
    showProviderInstrumentsDetails,
    showInstrumentsRevisions,
    showProviderInstrumentsRevisions,
}: {
    approveInstruments: (instruments: TInstrument[]) => Promise<boolean>;
    showInstrumentsDetails: (instruments: TInstrument[]) => Promise<boolean>;
    showProviderInstrumentsDetails: (instruments: TInstrument[]) => Promise<boolean>;
    showInstrumentsRevisions: (instruments: TInstrument[]) => Promise<boolean>;
    showProviderInstrumentsRevisions: (instruments: TInstrument[]) => Promise<boolean>;
}): (params: GetContextMenuItemsParams<TInstrument>) => (string | MenuItemDef)[];
export function useGetInstrumentsListContextMenuItems({
    showInstrumentsDetails,
    showProviderInstrumentsDetails,
    showInstrumentsRevisions,
    showProviderInstrumentsRevisions,
}: {
    showInstrumentsDetails: (instruments: TInstrumentDynamicData[]) => Promise<boolean>;
    showProviderInstrumentsDetails: (instruments: TInstrumentDynamicData[]) => Promise<boolean>;
    showInstrumentsRevisions: (instruments: TInstrumentDynamicData[]) => Promise<boolean>;
    showProviderInstrumentsRevisions: (instruments: TInstrumentDynamicData[]) => Promise<boolean>;
}): (params: GetContextMenuItemsParams<TInstrumentDynamicData>) => (string | MenuItemDef)[];
export function useGetInstrumentsListContextMenuItems<
    T extends TInstrument | TInstrumentDynamicData,
>({
    approveInstruments,
    showInstrumentsDetails,
    showProviderInstrumentsDetails,
    showInstrumentsRevisions,
    showProviderInstrumentsRevisions,
}: {
    approveInstruments?: (instruments: TInstrument[]) => Promise<boolean>;
    showInstrumentsDetails: (instruments: T[]) => Promise<boolean>;
    showProviderInstrumentsDetails: (instruments: T[]) => Promise<boolean>;
    showInstrumentsRevisions: (instruments: T[]) => Promise<boolean>;
    showProviderInstrumentsRevisions: (instruments: T[]) => Promise<boolean>;
}): (params: GetContextMenuItemsParams<T>) => (string | MenuItemDef)[] {
    return useFunction((params: GetContextMenuItemsParams<T>): (string | MenuItemDef)[] => {
        const data = params.node?.data;
        const actions: (string | MenuItemDef)[] = [];

        if (isNil(data)) {
            return actions;
        }

        const instruments = getSelectedRowsWithOrder(params.api);
        const selectedInstruments = instruments.find(({ id }) => data.id === id)
            ? instruments
            : [data];

        if (!isNil(approveInstruments) && selectedInstruments.length > 0) {
            const allUnapproved = (selectedInstruments as TInstrument[]).every(
                ({ approvalStatus }) => approvalStatus === 'INSTRUMENT_APPROVAL_STATUS_UNAPPROVED',
            );

            actions.push({
                icon: svgCheck,
                name:
                    selectedInstruments.length > 1
                        ? `Approve ${selectedInstruments.length} instruments`
                        : `Approve instrument "${selectedInstruments[0].name}"`,
                disabled: !allUnapproved,
                action: () => approveInstruments(selectedInstruments as TInstrument[]),
                tooltip: allUnapproved
                    ? undefined
                    : `All instruments should be ${statusToDisplayStatus(
                          'INSTRUMENT_APPROVAL_STATUS_UNAPPROVED',
                      )}`,
            });

            actions.push(EDefaultContextMenuItemName.Separator);
        }

        actions.push({
            icon: svgProfile,
            name:
                selectedInstruments.length > 1
                    ? `Show ${selectedInstruments.length} instruments details`
                    : `Show "${selectedInstruments[0].name}" instrument details`,
            disabled: selectedInstruments.length === 0,
            action: () => showInstrumentsDetails(selectedInstruments),
        });

        actions.push({
            icon: svgProfile,
            name:
                selectedInstruments.length > 1
                    ? `Show ${selectedInstruments.length} provider instruments details`
                    : `Show "${selectedInstruments[0].name}" provider instrument details`,
            disabled: selectedInstruments.length === 0,
            action: () => showProviderInstrumentsDetails(selectedInstruments),
        });

        actions.push(EDefaultContextMenuItemName.Separator);

        actions.push({
            icon: svgBranches,
            name:
                selectedInstruments.length > 1
                    ? `Show ${selectedInstruments.length} instruments revisions details`
                    : `Show "${selectedInstruments[0].name}" instrument revisions`,
            disabled: selectedInstruments.length === 0,
            action: () => showInstrumentsRevisions(selectedInstruments),
        });

        actions.push({
            icon: svgBranches,
            name:
                selectedInstruments.length > 1
                    ? `Show ${selectedInstruments.length} provider instruments revisions details`
                    : `Show "${selectedInstruments[0].name}" provider instrument revisions`,
            disabled: selectedInstruments.length === 0,
            action: () => showProviderInstrumentsRevisions(selectedInstruments),
        });

        actions.push(EDefaultContextMenuItemName.Separator);

        return actions;
    });
}
