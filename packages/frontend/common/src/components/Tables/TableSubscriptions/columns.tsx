import { EDateTimeFormats } from '@common/types';
import { AgValue } from '@frontend/ag-grid/src/AgValue.ts';
import type { TColDef } from '@frontend/ag-grid/src/types.ts';
import { useMemo } from 'react';

import type { TSocketSubscriptionState } from '../../../modules/subscriptionsState/module.ts';
import { dateFormatter } from '../../AgTable/formatters/date.ts';
import {
    DescriptorNameCellRenderer,
    descriptorNameCellValueGetter,
} from './renderers/DescriptorNameRenderer.tsx';
import { ValueRenderer } from './renderers/ValueRenderer.tsx';
import type { TTableSubscriptionsProps } from './view.tsx';

export const useColumns = (
    timeZone: TTableSubscriptionsProps['timeZone'],
    onOpenEditor: TTableSubscriptionsProps['onOpenEditor'],
): TColDef<TSocketSubscriptionState>[] =>
    useMemo(
        () => [
            {
                field: 'descriptor.type',
                headerName: 'Type',
            },
            {
                colId: 'descriptorName',
                headerName: 'Descriptor',
                valueGetter: descriptorNameCellValueGetter,
                cellRenderer: DescriptorNameCellRenderer,
                equals: AgValue.isEqual,
            },
            {
                field: 'valueDescriptor.state',
                headerName: 'State',
            },
            {
                field: 'valueDescriptor.meta.pendingState',
                headerName: 'Pending State',
            },
            {
                field: 'params',
                valueFormatter: (params) => JSON.stringify(params.value),
            },
            {
                field: 'valueDescriptor.value',
                headerName: 'Last Value',
                cellRenderer: ValueRenderer,
                cellRendererSelector: () => ({
                    component: ValueRenderer,
                    params: { onOpenEditor },
                }),
            },
            {
                field: 'updateTime',
                valueFormatter: dateFormatter(timeZone, EDateTimeFormats.DateTimeMilliseconds),
            },
            {
                field: 'options.traceId',
                headerName: 'Trace ID',
            },
            {
                field: 'finished',
            },
        ],
        [onOpenEditor, timeZone],
    );
