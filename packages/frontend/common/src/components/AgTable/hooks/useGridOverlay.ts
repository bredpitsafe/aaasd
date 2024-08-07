import type { Nil } from '@common/types';
import type { GridApi } from '@frontend/ag-grid';
import { Events } from '@frontend/ag-grid';
import { isNil, isUndefined } from 'lodash-es';
import { useEffect, useMemo } from 'react';

import { useFunction } from '../../../utils/React/useFunction';
import { Binding } from '../../../utils/Tracing/Children/Binding.ts';
import { agTableLogger } from '../logger.ts';
import { getRowModelType, isClientRowModel } from '../utils';
import { useGridApiEvent } from './useGridApiEvent';
import { useGridIsInitialized } from './useGridIsInitialized.ts';

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
    if (isNil(gridApi)) {
        return;
    }

    const logger = agTableLogger.child([new Binding(gridApi.getGridId()), new Binding('Overlay')]);

    // @ts-ignore
    gridApi[FORCED_OVERLAY_SYMBOL] = overlay;
    gridApi.dispatchEvent({ type: EVENT_OVERLAY_UPDATED });
    logger.info('updated', { type: overlay });
}

export function useDefaultGridOverlayBehavior(
    gridApi: undefined | GridApi,
    rowData: Nil | Array<unknown>,
) {
    const gridReady = useGridIsInitialized(gridApi);

    const update = useFunction(() => {
        if (isNil(gridApi) || !gridReady) {
            return;
        }

        const logger = agTableLogger.child([
            new Binding(gridApi.getGridId()),
            new Binding('Overlay'),
        ]);

        const type = getOverlayType(gridApi, rowData);
        logger.info('update call', { type });

        switch (type) {
            case EAgGridOverlay.empty:
                return gridApi.showNoRowsOverlay();
            case EAgGridOverlay.loading:
                return gridApi.showLoadingOverlay();
            case EAgGridOverlay.none:
                return gridApi.hideOverlay();
        }
    });

    // Hack: If we have rowData=[] then AgGrid skips all rowData=undefined props changes
    useEffect(update, [update, rowData, gridReady]);

    const clientRowModel = !isNil(gridApi) && isClientRowModel(gridApi);

    useGridApiEvent(
        gridApi,
        update,
        ...useMemo(
            () =>
                clientRowModel
                    ? [Events.EVENT_MODEL_UPDATED, EVENT_OVERLAY_UPDATED]
                    : [EVENT_OVERLAY_UPDATED],
            [clientRowModel],
        ),
    );
}

function getOverlayType<T>(gridApi: GridApi<T>, rowData?: T[] | null): EAgGridOverlay {
    // @ts-ignore
    if (!isUndefined(gridApi[FORCED_OVERLAY_SYMBOL])) return gridApi[FORCED_OVERLAY_SYMBOL];

    const type = getRowModelType(gridApi);

    if (type === 'serverSide' || type === 'viewport') {
        return EAgGridOverlay.none;
    }

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
