import type { GridReadyEvent } from '@frontend/ag-grid';
import type { ReactElement } from 'react';

import { useFunction } from '../../utils/React/useFunction';
import { AgTable } from './AgTable';
import type { TAgTableWithRouterSyncProps } from './defs.ts';
import { useGetContextMenuItems } from './hooks/useGetContextMenuItems';
import { useGridApi } from './hooks/useGridApi';
import { useGridColumnState } from './hooks/useGridColumnState';

export function AgTableWithColumnsSync<RecordType>({
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

    const { copyTableState } = useGridColumnState(gridApi, columnApi);

    const getContextMenuItemsHandle = useGetContextMenuItems<RecordType>({
        getContextMenuItems,
        onCopyTableState: copyTableState,
        includeDefaultContextMenuItems,
    });

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
