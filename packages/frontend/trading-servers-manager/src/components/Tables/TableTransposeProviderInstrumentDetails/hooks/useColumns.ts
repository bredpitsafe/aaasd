import type { TInstrument } from '@backend/bff/src/modules/instruments/schemas/defs.ts';
import type { Nil, TimeZone } from '@common/types';
import type {
    CellClassParams,
    ColDef,
    EditableCallbackParams,
    ValueSetterParams,
} from '@frontend/ag-grid';
import { useDeepEqualProp } from '@frontend/common/src/hooks/useDeepEqualProp.ts';
import cn from 'classnames';
import { isEmpty, isNil } from 'lodash-es';
import { useMemo } from 'react';

import { EDefaultLayoutComponents } from '../../../../layouts/default.tsx';
import { CellValueRenderer } from '../../CellValueRenderer.tsx';
import type {
    EPropertyGroup,
    TEditablePropertyCell,
    TPropertyCell,
    TProviderPropertyRow,
} from '../../defs.ts';
import { EDataKind } from '../../defs.ts';
import { InstrumentHeader } from '../../InstrumentHeader.tsx';
import { getPropertyCellValueFormatter } from '../../utils/instruments.ts';
import { OverrideEditor } from '../OverrideEditor.tsx';
import { OverrideHeader } from '../OverrideHeader.tsx';
import { cnCellError, cnNonEditableCell, cnPinnedHeaderColumns } from '../styles.css.ts';
import {
    getEditablePropertyCellValueFormatter,
    getPackedProviderInstrumentColumnsNames,
} from '../utils.ts';

export function useColumns(
    instruments: TInstrument[],
    timeZone: TimeZone,
    removeInstrument: (instrumentId: number) => void,
    setOverrideProperty: (
        group: EPropertyGroup,
        property: string,
        editableCell: Nil | TEditablePropertyCell,
    ) => boolean,
): ColDef<TProviderPropertyRow>[] {
    const providerInstruments = useDeepEqualProp(
        useMemo(() => getPackedProviderInstrumentColumnsNames(instruments), [instruments]),
    );

    return useMemo(
        (): ColDef<TProviderPropertyRow>[] => [
            {
                field: 'group',
                rowGroup: true,
                rowGroupIndex: 1,
                hide: true,
                maxWidth: 150,
            },
            {
                field: 'property',
                headerName: 'Property',
                pinned: 'left',
                cellClass: cnPinnedHeaderColumns,
            },
            ...providerInstruments.map(({ id, name, group, items }) => ({
                headerGroupComponent: InstrumentHeader,
                headerGroupComponentParams: {
                    removeInstrument: removeInstrument.bind(undefined, id),
                },
                groupId: group,
                headerName: `${id} | ${name}`,
                marryChildren: true,
                children: items.map(
                    ({ field, name }): ColDef<TProviderPropertyRow> => ({
                        field,
                        headerName: name,
                        cellRenderer: CellValueRenderer,
                        cellRendererParams: {
                            timeZone,
                            revisionsTab: EDefaultLayoutComponents.ProviderInstrumentRevisions,
                        },
                        cellClass: ({
                            value,
                        }: CellClassParams<TProviderPropertyRow, undefined | TPropertyCell>) =>
                            cn({
                                [cnCellError]: !isEmpty(value?.errors),
                            }),
                        valueFormatter: getPropertyCellValueFormatter(timeZone),
                        useValueFormatterForExport: true,
                        suppressMovable: false,
                    }),
                ),
            })),
            {
                minWidth: 200,

                field: 'override',
                headerName: 'Override',
                pinned: 'right',
                headerComponent: OverrideHeader,
                hide: providerInstruments.length === 0,

                cellClass: ({
                    data,
                    value,
                }: CellClassParams<TProviderPropertyRow, undefined | TEditablePropertyCell>) =>
                    cn({
                        [cnNonEditableCell]: !isEditable(data),
                        [cnCellError]: !isEmpty(value?.errors),
                    }),

                // View
                cellRenderer: CellValueRenderer,
                cellRendererParams: { timeZone },
                valueFormatter: getEditablePropertyCellValueFormatter(timeZone),
                useValueFormatterForExport: true,

                // Edit
                editable: ({
                    data,
                }: EditableCallbackParams<
                    TProviderPropertyRow,
                    undefined | TEditablePropertyCell
                >) => isEditable(data),
                valueSetter: (
                    params: ValueSetterParams<TProviderPropertyRow, TEditablePropertyCell>,
                ) =>
                    setOverrideProperty(
                        params.data.group as EPropertyGroup,
                        params.data.property,
                        params.newValue,
                    ),
                cellEditor: OverrideEditor,
                cellEditorParams: { timeZone },
                suppressKeyboardEvent: ({ data, editing, event }) =>
                    isEditable(data) &&
                    editing &&
                    event.code === 'Enter' &&
                    !([EDataKind.Number, EDataKind.String] as (EDataKind | undefined)[]).includes(
                        data?.override?.kind,
                    ),
            },
        ],
        [providerInstruments, timeZone, removeInstrument, setOverrideProperty],
    );
}

function isEditable(row: undefined | TProviderPropertyRow): boolean {
    return !isNil(row?.override) && row.override.editable;
}
