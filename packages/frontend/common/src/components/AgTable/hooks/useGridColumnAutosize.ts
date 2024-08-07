import type {
    ColumnApi,
    ColumnResizedEvent,
    GridApi,
    ModelUpdatedEvent,
    PaginationChangedEvent,
    ViewportChangedEvent,
    VirtualRowRemovedEvent,
} from '@frontend/ag-grid';
import { Events } from '@frontend/ag-grid';
import { isNil } from 'lodash-es';
import { useEffect, useMemo } from 'react';
import { asyncScheduler, firstValueFrom, merge, of } from 'rxjs';
import { defaultIfEmpty, filter, map, takeUntil, timeout } from 'rxjs/operators';

import { useDebouncedFunction } from '../../../utils/React/useDebouncedFunction';
import { Binding } from '../../../utils/Tracing/Children/Binding.ts';
import {
    EVENT_GRID_FIRST_SERVER_DATA_RECEIVED,
    EVENT_GRID_VIEWPORT_COLUMNS_CHANGED,
} from '../defs.ts';
import { agTableLogger } from '../logger.ts';
import {
    applyAutoSizeDisplayColumns,
    fromAgGridEvent,
    hasFirstDataRenderedEvent,
    isClientRowModel,
    isUserColumnAction,
} from '../utils';
import { useGridApiEvent, useGridApiEventOnce } from './useGridApiEvent';
import { useGridId } from './useGridId.ts';
import { useGridIsInitialized } from './useGridIsInitialized';
import { useVirtualColumnsChanged } from './useVirtualColumnsChanged.ts';

const AUTOSIZE_DEBOUNCE_TIMEOUT = 50;
const MODEL_UPDATE_TIMEOUT = 10_000;

const COMMON_AUTOSIZE_EVENTS = [
    EVENT_GRID_VIEWPORT_COLUMNS_CHANGED,
    Events.EVENT_ROW_GROUP_OPENED,
    Events.EVENT_GRID_SIZE_CHANGED,
    Events.EVENT_GRID_COLUMNS_CHANGED,
];

const TRIGGER_AUTOSIZE = 'TRIGGER_AUTOSIZE';

const IMMEDIATE_AUTOSIZE_EVENTS = new Set([TRIGGER_AUTOSIZE, Events.EVENT_FIRST_DATA_RENDERED]);

export function useGridColumnAutosize<RecordType>(
    gridApi: undefined | GridApi<RecordType>,
    colApi: undefined | ColumnApi,
    suppressAutoSize: boolean = false,
) {
    const id = useGridId(gridApi);

    const logger = useMemo(
        () => agTableLogger.child([new Binding('ColumnState'), new Binding(id)]),
        [id],
    );

    const gridReady = useGridIsInitialized(gridApi);

    useVirtualColumnsChanged(gridApi);

    const clientRowModel = !isNil(gridApi) && isClientRowModel(gridApi);
    const hasFirstDataRendered = !isNil(gridApi) && hasFirstDataRenderedEvent(gridApi);

    const cbAutosizeAll = useDebouncedFunction(
        async ({ type }) => {
            if (isNil(gridApi) || isNil(colApi) || !gridReady || suppressAutoSize) {
                return;
            }

            if (!clientRowModel && !IMMEDIATE_AUTOSIZE_EVENTS.has(type)) {
                const needAutosize = await firstValueFrom(
                    merge(
                        fromAgGridEvent<RecordType, ModelUpdatedEvent<RecordType>>(
                            gridApi,
                            Events.EVENT_MODEL_UPDATED,
                        ),
                        fromAgGridEvent<RecordType, PaginationChangedEvent<RecordType>>(
                            gridApi,
                            Events.EVENT_PAGINATION_CHANGED,
                        ),
                        fromAgGridEvent<RecordType, VirtualRowRemovedEvent<RecordType>>(
                            gridApi,
                            Events.EVENT_VIRTUAL_ROW_REMOVED,
                        ),
                        fromAgGridEvent<RecordType, ViewportChangedEvent<RecordType>>(
                            gridApi,
                            Events.EVENT_VIEWPORT_CHANGED,
                        ),
                    ).pipe(
                        map(() => true),
                        timeout({
                            each: MODEL_UPDATE_TIMEOUT,
                            with: () => of(true),
                        }),
                        takeUntil(
                            fromAgGridEvent<RecordType, ColumnResizedEvent<RecordType>>(
                                gridApi,
                                Events.EVENT_COLUMN_RESIZED,
                            ).pipe(filter((e) => isUserColumnAction(e.source))),
                        ),
                        defaultIfEmpty(false),
                    ),
                );

                if (!needAutosize) {
                    return;
                }
            }

            // We need to give AgGrid some time to perform inner work to handle event
            asyncScheduler.schedule(() => {
                logger.trace('apply autosize');
                applyAutoSizeDisplayColumns(colApi);
            });
        },
        AUTOSIZE_DEBOUNCE_TIMEOUT,
        { leading: false, trailing: true },
    );

    const autoSizeEvents = useMemo(
        () =>
            hasFirstDataRendered
                ? [Events.EVENT_FIRST_DATA_RENDERED, ...COMMON_AUTOSIZE_EVENTS]
                : [EVENT_GRID_FIRST_SERVER_DATA_RECEIVED, ...COMMON_AUTOSIZE_EVENTS],
        [hasFirstDataRendered],
    );
    const autoSizeInitEvents = useMemo(
        () => (clientRowModel ? [] : [Events.EVENT_PAGINATION_CHANGED]),
        [clientRowModel],
    );

    useGridApiEvent(gridApi, cbAutosizeAll, ...autoSizeEvents);
    useGridApiEventOnce(gridApi, cbAutosizeAll, ...autoSizeInitEvents);

    useEffect(() => {
        if (gridReady) {
            cbAutosizeAll({ type: TRIGGER_AUTOSIZE });
        }
    }, [gridReady, cbAutosizeAll, suppressAutoSize]);
}
