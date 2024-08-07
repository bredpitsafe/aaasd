import type { ColumnEvent, GridApi } from '@frontend/ag-grid';
import { isNil, once } from 'lodash-es';
import { useEffect } from 'react';

export type TUseGridApiEventCallback<RecordType> = (event: ColumnEvent<RecordType>) => void;

export function useGridApiEvent<RecordType>(
    api: GridApi<RecordType> | undefined,
    callback: TUseGridApiEventCallback<RecordType>,
    ...events: string[]
): void {
    useEffect(() => {
        if (isNil(api) || events.length === 0) {
            return;
        }

        events.forEach((event) => api.addEventListener(event, callback));

        return () => events.forEach((event) => api.removeEventListener(event, callback));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [api, events.toString(), callback]);
}

export function useGridApiEventOnce<RecordType>(
    api: GridApi<RecordType> | undefined,
    callback: TUseGridApiEventCallback<RecordType>,
    ...events: string[]
): void {
    useEffect(() => {
        if (isNil(api) || events.length === 0) {
            return;
        }

        const onceCallback = once(callback);

        events.forEach((event) => api.addEventListener(event, onceCallback));

        return () => events.forEach((event) => api.removeEventListener(event, onceCallback));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [api, callback, events.toString()]);
}
