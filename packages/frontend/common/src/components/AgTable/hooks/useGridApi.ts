import type { ColumnApi, GridApi, GridReadyEvent } from '@frontend/ag-grid';
import { useCallback, useState } from 'react';

type TUseGridApiReturnType<RecordType> = {
    onGridReady: (event: GridReadyEvent) => void;
    gridApi: GridApi<RecordType> | undefined;
    columnApi: ColumnApi | undefined;
};

export function useGridApi<RecordType>(): TUseGridApiReturnType<RecordType> {
    const [gridApi, setGridApi] = useState<GridApi<RecordType>>();
    const [columnApi, setColumnApi] = useState<ColumnApi>();

    const onGridReady = useCallback((event: GridReadyEvent) => {
        setGridApi(event.api);
        setColumnApi(event.columnApi);
    }, []);

    return {
        gridApi,
        columnApi,
        onGridReady,
    };
}
