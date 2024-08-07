import type {
    TIndex,
    TIndexApprovalStatus,
} from '@backend/bff/src/modules/instruments/schemas/defs.ts';
import type { TimeZone } from '@common/types';
import type { ColDef, ValueFormatterParams } from '@frontend/ag-grid';
import { FLOATING_SET_FILTER, FLOATING_TEXT_FILTER } from '@frontend/ag-grid/src/filters.ts';
import { cnNoPaddingCell } from '@frontend/common/src/components/AgTable/AgTable.css.ts';
import { getTimeColumn } from '@frontend/common/src/components/AgTable/columns/getTimeColumn.ts';
import { statusToDisplayStatus } from '@frontend/common/src/utils/instruments/converters.ts';
import { isNil } from 'lodash-es';
import { useMemo } from 'react';

import { StatusRenderer } from '../StatusRenderer.tsx';

export function useColumns(timeZone: TimeZone): ColDef<TIndex>[] {
    return useMemo(
        () => [
            {
                field: 'id',
                headerName: 'ID',
                cellRenderer: 'agGroupCellRenderer',
            },
            {
                field: 'name',
                headerName: 'Name',
                sortable: true,
                sort: 'asc',
                ...FLOATING_TEXT_FILTER,
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
                        'INDEX_APPROVAL_STATUS_UNAPPROVED',
                        'INDEX_APPROVAL_STATUS_APPROVED',
                    ] as TIndexApprovalStatus[],
                    valueFormatter: ({
                        value,
                    }: ValueFormatterParams<TIndex, TIndexApprovalStatus>) =>
                        isNil(value) ? '' : statusToDisplayStatus(value),
                },
                valueFormatter: ({ value }: ValueFormatterParams<TIndex, TIndexApprovalStatus>) =>
                    isNil(value) ? '' : statusToDisplayStatus(value),
                useValueFormatterForExport: true,
            },
            {
                ...getTimeColumn('platformTime', 'Platform Time', timeZone),
                sortable: true,
            },
        ],
        [timeZone],
    );
}
