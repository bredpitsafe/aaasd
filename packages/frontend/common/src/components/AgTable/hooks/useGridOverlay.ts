import { Events, GridApi } from '@frontend/ag-grid';
import { isNil, isUndefined } from 'lodash-es';
import { useEffect } from 'react';

import { Nil } from '../../../types';
import { useFunction } from '../../../utils/React/useFunction';
import { useGridApiEvent } from './useGridApiEvent';

const FORCED_OVERLAY_SYMBOL = Symbol('FORCED_OVERLAY');

export enum EAgGridOverlay {
    none = 'none',
    empty = 'empty',
    loading = 'loading',
}

const EVENT_OVERLAY_UPDATED = 'overlayUpdated';

/**
 * HACK: Due to a limitation in ag-Grid api which does not differentiate
 * between `undefined` and an empty array for `rowData`, we're using a Symbol
 * and attaching it directly to the `gridApi`.
 * This allows us to keep track of the data state and differentiate between the two states using only the `gridApi`.
 */
export function useGridOverlay(gridApi: undefined | GridApi, overlay: undefined | EAgGridOverlay) {
    if (isUndefined(gridApi)) return;
    // @ts-ignore
    gridApi[FORCED_OVERLAY_SYMBOL] = overlay;
    gridApi.dispatchEvent({ type: EVENT_OVERLAY_UPDATED });
}

export function useDefaultGridOverlayBehavior(
    gridApi: undefined | GridApi,
    rowData: Nil | Array<unknown>,
) {
    const update = useFunction(() => {
        if (isUndefined(gridApi)) return;

        if (gridApi.getModel().getType() === 'infinite') return;

        const overlayType = getOverlayType(gridApi, rowData);

        switch (overlayType) {
            case EAgGridOverlay.empty:
                return gridApi.showNoRowsOverlay();
            case EAgGridOverlay.loading:
                return gridApi.showLoadingOverlay();
            case EAgGridOverlay.none:
                return gridApi.hideOverlay();
        }
    });

    // Hack: If we have rowData=[] then AgGrid skips all rowData=undefined props changes
    useEffect(update, [update, rowData]);
    useGridApiEvent(gridApi, update, Events.EVENT_MODEL_UPDATED, EVENT_OVERLAY_UPDATED);
}

function getOverlayType<T>(gridApi: GridApi<T>, rowData?: T[] | null): EAgGridOverlay {
    // @ts-ignore
    if (!isUndefined(gridApi[FORCED_OVERLAY_SYMBOL])) return gridApi[FORCED_OVERLAY_SYMBOL];

    const model = gridApi.getModel();
    const modelType = model.getType();
    const isEmpty = model.isEmpty();
    const isRowsToRender = model.isRowsToRender();
    if (isNil(rowData)) return EAgGridOverlay.loading;

    if (
        isEmpty ||
        // Ag-Grid, by default, does not display a 'No Rows To Show' overlay when filters result in no data
        (modelType === 'clientSide' && !isRowsToRender)
    ) {
        return EAgGridOverlay.empty;
    }

    return EAgGridOverlay.none;
}
