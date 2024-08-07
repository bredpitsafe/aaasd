import type { CellEditRequestEvent } from '@frontend/ag-grid';
import { isUndefined } from 'lodash-es';

import { useFunction } from '../../../utils/React/useFunction';

type TUseCellEditRequestCallback<T> = (event: CellEditRequestEvent<T>) => Promise<void>;

export type TUseCellEditRequestParams<T> = {
    onEditField: (event: CellEditRequestEvent<T>, fieldId: string) => Promise<void>;
};
export const useCellEditRequest = <T>(
    params: TUseCellEditRequestParams<T>,
): TUseCellEditRequestCallback<T> => {
    return useFunction(async (event: CellEditRequestEvent<T>) => {
        const data = event.data;
        const fieldId = event.colDef.field;
        if (isUndefined(fieldId)) {
            return;
        }

        // Apply new value to field
        const newData = { ...data };
        // @ts-ignore
        newData[fieldId] = event.newValue;
        event.api.applyTransaction({
            update: [newData],
        });

        // Call callback function and wait for promise to settle
        try {
            await params.onEditField(event, fieldId);
            // If resolved, flash cell to show operation success
            event.api.flashCells({ rowNodes: [event.node], columns: [fieldId] });
        } catch (err) {
            // If rejected, fall back to original data
            event.api.applyTransaction({
                update: [data],
            });
        }
    });
};
