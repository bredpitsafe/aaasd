import type { TColDef } from '@frontend/ag-grid/src/types';
import { DefaultTooltip } from '@frontend/common/src/components/AgTable/tooltips/DefaultTooltip';
import {
    type TComponentStatusInfo,
    EComponentStatus,
} from '@frontend/common/src/types/domain/balanceMonitor/defs';
import { useMemo } from 'react';

import { createRowIndexColumn, FLOATING_TEXT_FILTER, getFloatingStatusFilter } from '../../utils';
import { StatusCellRenderer } from '../components/StatusCellRenderer';
import { cnActionCellClass } from '../view.css';

export function useColumns(): TColDef<TComponentStatusInfo>[] {
    return useMemo(
        () => [
            createRowIndexColumn(),

            {
                field: 'componentId',
                headerName: 'Component Id',
                sort: 'asc',
                ...FLOATING_TEXT_FILTER,
            },
            {
                field: 'status',
                headerName: 'Status',
                cellRenderer: StatusCellRenderer,
                cellClass: () => cnActionCellClass,
                ...getFloatingStatusFilter(Object.values(EComponentStatus)),
            },
            {
                field: 'description',
                headerName: 'Description',
                tooltipField: 'description',
                tooltipComponent: DefaultTooltip,
                ...FLOATING_TEXT_FILTER,
            },
        ],
        [],
    );
}
