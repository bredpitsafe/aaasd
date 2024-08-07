import type { GridReadyEvent } from '@frontend/ag-grid';
import type { ReactElement } from 'react';

import { useFunction } from '../../utils/React/useFunction';
import { AgTable } from './AgTable';
import type { TAgTableWithRouterSyncProps } from './defs.ts';
import { useGetContextMenuItems } from './hooks/useGetContextMenuItems';
import { useGridApi } from './hooks/useGridApi';
import { useGridColumnAutosize } from './hooks/useGridColumnAutosize.ts';
import { useGridFilterState } from './hooks/useGridFilterState';

export function AgTableWithFilterSync<RecordType>({
    id: tableId,
    onGridReady: onGridReadyProps,
    getContextMenuItems,
    includeDefaultContextMenuItems,
    rowModelType,
    ...restProps
}: TAgTableWithRouterSyncProps<RecordType>): ReactElement {
    const { gridApi, columnApi, onGridReady: onGridReadyApi } = useGridApi<RecordType>();

    const cbGridReady = useFunction((event: GridReadyEvent<RecordType>) => {
        onGridReadyApi(event);
        onGridReadyProps?.(event);
    });

    const getContextMenuItemsHandle = useGetContextMenuItems<RecordType>({
        getContextMenuItems,
        includeDefaultContextMenuItems,
    });

    useGridColumnAutosize(gridApi, columnApi);
    useGridFilterState(gridApi);

    return (
        <AgTable
            gridId={tableId}
            onGridReady={cbGridReady}
            getContextMenuItems={getContextMenuItemsHandle}
            rowModelType={rowModelType}
            {...restProps}
        />
    );
}
