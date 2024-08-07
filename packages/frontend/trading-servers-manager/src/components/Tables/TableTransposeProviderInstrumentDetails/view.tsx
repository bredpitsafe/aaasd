import type {
    TInstrument,
    TProviderInstrumentDetails,
} from '@backend/bff/src/modules/instruments/schemas/defs.ts';
import type { TimeZone } from '@common/types';
import type { ColDef, GetRowIdParams } from '@frontend/ag-grid';
import { AgTableWithFilterSync } from '@frontend/common/src/components/AgTable/AgTableWithFilterSync.tsx';
import { Error } from '@frontend/common/src/components/Error/view';
import { LoadingOverlay } from '@frontend/common/src/components/overlays/LoadingOverlay';
import { ETableIds } from '@frontend/common/src/modules/clientTableFilters/data.ts';
import { EMPTY_ARRAY } from '@frontend/common/src/utils/const.ts';
import { useFunction } from '@frontend/common/src/utils/React/useFunction.ts';
import type { TValueDescriptor2 } from '@frontend/common/src/utils/ValueDescriptor/types.ts';
import {
    isFailValueDescriptor,
    isSyncedValueDescriptor,
} from '@frontend/common/src/utils/ValueDescriptor/utils.ts';
import { isEmpty } from 'lodash-es';
import { memo, useMemo } from 'react';

import type { TProviderPropertyRow } from '../defs.ts';
import { cnRoot } from '../view.css.ts';
import { useColumns } from './hooks/useColumns.ts';
import { useGetContextMenuItems } from './hooks/useGetContextMenuItems.ts';
import { useOverride } from './hooks/useOverride.ts';
import { useTransposeProviderInstruments } from './hooks/useTransposeProviderInstruments.ts';
import { useValidateOverride } from './hooks/useValidateOverride.ts';
import { OverrideContext } from './OverrideContext.ts';
import { getProviderInstrumentDetailsFromOverride, ROW_CLASS_RULES } from './utils.ts';

export const TableTransposeProviderInstrumentDetails = memo(
    ({
        instrumentsDesc,
        timeZone,
        updateProviderInstrumentsOverride,
        showProviderInstrumentsRevisions,
        onRemoveInstrument,
    }: {
        instrumentsDesc: TValueDescriptor2<TInstrument[]>;
        timeZone: TimeZone;
        updateProviderInstrumentsOverride: (
            instruments: TInstrument[],
            providerInstrumentDetails: TProviderInstrumentDetails | undefined,
            timeZone: TimeZone,
        ) => Promise<boolean>;
        showProviderInstrumentsRevisions: (instruments: TInstrument[]) => Promise<boolean>;
        onRemoveInstrument: (instrumentId: number) => void;
    }) => {
        const instruments: TInstrument[] = instrumentsDesc.value ?? EMPTY_ARRAY;

        const [override, setOverrideProperty, clearOverride] = useOverride();

        const overrideValidation = useValidateOverride(override);

        const submitOverrideUpdate = useFunction(async () => {
            if (isEmpty(instruments)) {
                return;
            }

            const providerInstrumentDetails = getProviderInstrumentDetailsFromOverride(override);

            const succeed = await updateProviderInstrumentsOverride(
                instruments,
                providerInstrumentDetails,
                timeZone,
            );

            if (succeed) {
                clearOverride();
            }
        });

        const providerInstrumentColumns = useColumns(
            instruments,
            timeZone,
            onRemoveInstrument,
            setOverrideProperty,
        );
        const providerInstrumentRows = useTransposeProviderInstruments(
            instrumentsDesc,
            override,
            overrideValidation,
        );

        const getRowId = useFunction(
            ({ data: { group, property } }: GetRowIdParams<TProviderPropertyRow>) =>
                `${group}-${property}`,
        );
        const groupRowRendererParams = useMemo(
            () => ({
                suppressCount: true,
            }),
            [],
        );
        const defaultColDef = useMemo(
            (): ColDef<TProviderPropertyRow> => ({
                filter: false,
                sortable: false,
                suppressMovable: true,
            }),
            [],
        );

        const overrideContext = useMemo(
            () => ({
                submitOverrideUpdate,
                overrideValidation,
                instruments,
            }),
            [submitOverrideUpdate, overrideValidation, instruments],
        );

        const getContextMenuItems = useGetContextMenuItems({
            instruments,
            showProviderInstrumentsRevisions,
        });

        return (
            <div className={cnRoot}>
                {isSyncedValueDescriptor(instrumentsDesc) ? (
                    <OverrideContext.Provider value={overrideContext}>
                        <AgTableWithFilterSync<TProviderPropertyRow>
                            id={ETableIds.TransposeProviderInstrumentDetails}
                            rowData={providerInstrumentRows}
                            getRowId={getRowId}
                            columnDefs={providerInstrumentColumns}
                            rowSelection="multiple"
                            groupDefaultExpanded={-1}
                            rowGroupPanelShow="never"
                            groupDisplayType="groupRows"
                            groupRowRendererParams={groupRowRendererParams}
                            rowClassRules={ROW_CLASS_RULES}
                            defaultColDef={defaultColDef}
                            getContextMenuItems={getContextMenuItems}
                        />
                    </OverrideContext.Provider>
                ) : isFailValueDescriptor(instrumentsDesc) ? (
                    <Error status="error" title="Failed to load instruments" />
                ) : (
                    <LoadingOverlay text="Loading instruments..." />
                )}
            </div>
        );
    },
);
