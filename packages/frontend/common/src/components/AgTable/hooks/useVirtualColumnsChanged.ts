import type { ColumnEvent, GridApi } from '@frontend/ag-grid';
import { Events } from '@frontend/ag-grid';
import { useRef } from 'react';

import { useFunction } from '../../../utils/React/useFunction.ts';
import { EVENT_GRID_VIEWPORT_COLUMNS_CHANGED } from '../defs.ts';
import { useGridApiEvent } from './useGridApiEvent.ts';

export function useVirtualColumnsChanged<RecordType>(gridApi: GridApi<RecordType> | undefined) {
    const lockVirtualColumnsChangedRef = useRef(false);

    useGridApiEvent(
        gridApi,
        useFunction(({ type, api }: ColumnEvent) => {
            switch (type) {
                case Events.EVENT_DRAG_STARTED:
                    lockVirtualColumnsChangedRef.current = true;
                    break;
                case Events.EVENT_DRAG_STOPPED:
                    lockVirtualColumnsChangedRef.current = false;
                    break;
                case Events.EVENT_VIRTUAL_COLUMNS_CHANGED:
                    if (!lockVirtualColumnsChangedRef.current) {
                        api.dispatchEvent({ type: EVENT_GRID_VIEWPORT_COLUMNS_CHANGED });
                    }
                    break;
            }
        }),
        Events.EVENT_VIRTUAL_COLUMNS_CHANGED,
        Events.EVENT_DRAG_STARTED,
        Events.EVENT_DRAG_STOPPED,
    );
}
