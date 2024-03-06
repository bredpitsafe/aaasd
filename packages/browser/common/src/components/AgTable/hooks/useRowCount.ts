import { GridApi } from 'ag-grid-community';
import { ColumnEvent } from 'ag-grid-community/dist/lib/events';
import { useState } from 'react';

import { useFunction } from '../../../utils/React/useFunction';
import { useGridApiEvent } from './useGridApiEvent';

export function useRowCount<RecordType>(api: undefined | GridApi<RecordType>) {
    const [count, setCount] = useState(0);
    const onRowDataUpdate = useFunction((event: ColumnEvent<RecordType>) => {
        setCount(event.api.getModel().getRowCount());
    });

    useGridApiEvent(api, onRowDataUpdate, 'rowDataUpdated');

    return count;
}
