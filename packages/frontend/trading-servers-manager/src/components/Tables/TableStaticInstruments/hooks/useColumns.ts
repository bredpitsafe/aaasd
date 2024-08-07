import type {
    TInstrument,
    TInstrumentApprovalStatus,
    TInstrumentKind,
} from '@backend/bff/src/modules/instruments/schemas/defs.ts';
import type { TimeZone } from '@common/types';
import type { ColDef, ValueFormatterParams } from '@frontend/ag-grid';
import { FLOATING_SET_FILTER, FLOATING_TEXT_FILTER } from '@frontend/ag-grid/src/filters.ts';
import { cnNoPaddingCell } from '@frontend/common/src/components/AgTable/AgTable.css.ts';
import { getTimeColumn } from '@frontend/common/src/components/AgTable/columns/getTimeColumn.ts';
import {
    kindToDisplayKind,
    statusToDisplayStatus,
} from '@frontend/common/src/utils/instruments/converters.ts';
import { isNil } from 'lodash-es';
import { useMemo } from 'react';

import { WidgetInstrumentNameRenderer } from '../../../../widgets/WidgetInstrumentNameRenderer.tsx';
import { cnEnumValue } from '../../view.css.ts';
import { InstrumentIdRenderer } from '../InstrumentIdRenderer.tsx';
import { StatusRenderer } from '../StatusRenderer.tsx';

export function useColumns(timeZone: TimeZone): ColDef<TInstrument>[] {
    return useMemo(
        () => [
            {
                field: 'id',
                headerName: 'ID',
                cellRenderer: 'agGroupCellRenderer',
                cellRendererParams: { innerRenderer: InstrumentIdRenderer },
                sortable: true,
            },
            {
                field: 'name',
                headerName: 'Name',
                sortable: true,
                cellRenderer: WidgetInstrumentNameRenderer,
                sort: 'asc',
                ...FLOATING_TEXT_FILTER,
            },
            {
                field: `kind.type`,
                headerName: 'Kind',
                valueFormatter: ({
                    value,
                }: ValueFormatterParams<
                    TInstrument,
                    Exclude<TInstrument['kind'], undefined>['type']
                >) => (isNil(value) ? '' : kindToDisplayKind(value)),
                cellClass: cnEnumValue,
                useValueFormatterForExport: true,
                sortable: true,
                ...FLOATING_SET_FILTER,
                filterParams: {
                    values: [
                        'INSTRUMENT_KIND_INSTANT_SPOT',
                        'INSTRUMENT_KIND_SPOT',
                        'INSTRUMENT_KIND_FUTURES',
                        'INSTRUMENT_KIND_PERP_FUTURES',
                        'INSTRUMENT_KIND_OPTION',
                        'INSTRUMENT_KIND_INSTRUMENT_SWAP',
                    ] as TInstrumentKind[],
                    valueFormatter: ({
                        value,
                    }: ValueFormatterParams<TInstrument, TInstrumentKind>) =>
                        isNil(value) ? '' : kindToDisplayKind(value),
                },
            },
            {
                field: 'approvalStatus',
                headerName: 'Status',
                sortable: true,
                cellRenderer: StatusRenderer,
                cellClass: cnNoPaddingCell,
                ...FLOATING_SET_FILTER,
                filterParams: {
                    values: [
                        'INSTRUMENT_APPROVAL_STATUS_UNREDUCED',
                        'INSTRUMENT_APPROVAL_STATUS_UNAPPROVED',
                        'INSTRUMENT_APPROVAL_STATUS_APPROVED',
                        'INSTRUMENT_APPROVAL_STATUS_BLOCKED',
                        'INSTRUMENT_APPROVAL_STATUS_UNREDUCED_AFTER_APPROVAL',
                    ] as TInstrumentApprovalStatus[],
                    valueFormatter: ({
                        value,
                    }: ValueFormatterParams<TInstrument, TInstrumentApprovalStatus>) =>
                        isNil(value) ? '' : statusToDisplayStatus(value),
                },
                valueFormatter: ({
                    value,
                }: ValueFormatterParams<TInstrument, TInstrumentApprovalStatus>) =>
                    isNil(value) ? '' : statusToDisplayStatus(value),
                useValueFormatterForExport: true,
            },
            {
                field: 'exchange',
                headerName: 'Exchange',
                sortable: true,
                ...FLOATING_TEXT_FILTER,
            },
            {
                field: 'user',
                headerName: 'User',
            },
            {
                ...getTimeColumn('platformTime', 'Platform Time', timeZone),
                sortable: true,
            },
        ],
        [timeZone],
    );
}
