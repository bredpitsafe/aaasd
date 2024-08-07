import type { GridApi, RowNode } from '@frontend/ag-grid';
import { Events } from '@frontend/ag-grid';
import { useEffect, useLayoutEffect, useRef } from 'react';

export function useStickyScroll(gridApi: undefined | GridApi, deps: unknown[]): void {
    const rowSticky = useRef<RowNode | undefined>();
    const bottomSticky = useRef<boolean>(false);

    useLayoutEffect(() => {
        if (gridApi === undefined) return;

        const lastRow = getActuallyLastDisplayedRow(gridApi);

        bottomSticky.current =
            typeof lastRow?.rowIndex === 'number' &&
            lastRow.rowIndex === gridApi.getModel().getRowCount() - 1;

        const firstRow = getActuallyFirstDisplayedRow(gridApi);

        rowSticky.current =
            typeof firstRow?.rowIndex === 'number' && firstRow.rowIndex > 0 ? firstRow : undefined;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);

    useEffect(() => {
        if (gridApi === undefined) return;

        const cb = () => {
            if (bottomSticky.current) {
                gridApi.ensureIndexVisible(gridApi.getModel().getRowCount() - 1);
            } else if (rowSticky.current !== undefined) {
                gridApi.ensureNodeVisible(rowSticky.current, 'top');
            }

            bottomSticky.current = false;
            rowSticky.current = undefined;
        };

        gridApi.addEventListener(Events.EVENT_ROW_DATA_UPDATED, cb);
        gridApi.addEventListener(Events.EVENT_MODEL_UPDATED, cb);

        return () => {
            gridApi.removeEventListener(Events.EVENT_ROW_DATA_UPDATED, cb);
            gridApi.removeEventListener(Events.EVENT_MODEL_UPDATED, cb);
        };
    }, [gridApi]);
}

function getActuallyFirstDisplayedRow<T>(gridApi: GridApi<T>): undefined | RowNode<T> {
    // @ts-ignore
    const viewport = gridApi.gridBodyCtrl?.eBodyViewport as undefined | HTMLElement;

    if (viewport === undefined) return undefined;

    const st = viewport.scrollTop;
    const index = gridApi.getModel().getRowIndexAtPixel(st);
    return index === undefined ? undefined : gridApi.getModel().getRow(index);
}

function getActuallyLastDisplayedRow<T>(gridApi: GridApi<T>): undefined | RowNode<T> {
    // @ts-ignore
    const viewport = gridApi.gridBodyCtrl?.eBodyViewport as undefined | HTMLElement;

    if (viewport === undefined) return undefined;

    const height = viewport.scrollTop + viewport.offsetHeight;
    const index = gridApi.getModel().getRowIndexAtPixel(height);
    return index === undefined ? undefined : gridApi.getModel().getRow(index);
}
