import type { ColumnEvent, GridApi } from '@frontend/ag-grid';
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
