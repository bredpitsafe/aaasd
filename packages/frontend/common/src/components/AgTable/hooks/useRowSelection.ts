import type { SelectionChangedEvent } from '@frontend/ag-grid';
import { useCallback, useState } from 'react';

type TUseRowSelectionReturnType<RecordType> = {
    onSelectionChanged: (event: SelectionChangedEvent) => void;
    selectedRows: RecordType[];
};

export function useRowSelection<RecordType>(): TUseRowSelectionReturnType<RecordType> {
    const [selectedRows, setSelectedRows] = useState<RecordType[]>([]);

    const onSelectionChanged = useCallback((event: SelectionChangedEvent) => {
        setSelectedRows(event.api.getSelectedRows());
    }, []);

    return {
        selectedRows,
        onSelectionChanged,
    };
}
