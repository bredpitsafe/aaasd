import type { TBase64 } from '@common/utils/src/base64.ts';
import { base64ToObject, objectToBase64 } from '@common/utils/src/base64.ts';
import type { ColumnApi, ColumnEvent, GridApi } from '@frontend/ag-grid';
import { Events } from '@frontend/ag-grid';
import { isEmpty, isNil, isUndefined } from 'lodash-es';
import { useEffect, useMemo } from 'react';
import { useMountedState } from 'react-use';
import { map } from 'rxjs/operators';

import { useModule } from '../../../di/react';
import { ModuleMessages } from '../../../lib/messages';
import { ModuleRouter } from '../../../modules/router';
import type { TTypicalRouterData } from '../../../modules/router/defs';
import { ETypicalSearchParams } from '../../../modules/router/defs';
import { extractRouterParam } from '../../../modules/router/utils';
import { ModuleTableStates } from '../../../modules/tables';
import type { TTableState } from '../../../modules/tables/data';
import type { TRouterSubscribeState } from '../../../types/router';
import { clipboardWrite } from '../../../utils/clipboard';
import { useDebouncedFunction } from '../../../utils/React/useDebouncedFunction';
import { useFunction } from '../../../utils/React/useFunction';
import { useSyncObservable } from '../../../utils/React/useSyncObservable';
import { Binding } from '../../../utils/Tracing/Children/Binding.ts';
import { agTableLogger } from '../logger.ts';
import { isUserColumnAction } from '../utils';
import { useGridApiEvent } from './useGridApiEvent';
import { useGridColumnAutosize } from './useGridColumnAutosize.ts';
import { useGridId } from './useGridId.ts';
import { useGridIsInitialized } from './useGridIsInitialized';

const UPSERT_DEBOUNCE_TIMEOUT = 1_000;

type TUseGridStateReturnType = {
    state: TTableState | undefined;
    copyTableState: () => void;
};

export function useGridColumnState<RecordType>(
    gridApi: undefined | GridApi<RecordType>,
    colApi: undefined | ColumnApi,
): TUseGridStateReturnType {
    const id = useGridId(gridApi);
    const logger = useMemo(
        () => agTableLogger.child([new Binding('ColumnState'), new Binding(id)]),
        [id],
    );
    const {
        getState$: getPersistentState$,
        upsertState: upsertPersistentState,
        setUserResizedState: setUserResizedPersistentState,
    } = useModule(ModuleTableStates);
    const {
        state$: routeState$,
        setParams: setRouteParams,
        buildUrl: buildRouteUrl,
    } = useModule(ModuleRouter);
    const { success, error } = useModule(ModuleMessages);

    const persistentTableState$ = useMemo(
        () => getPersistentState$(id).pipe(map((state) => state ?? null)),
        [getPersistentState$, id],
    );
    const persistentTableState = useSyncObservable(persistentTableState$);

    const routeState = useSyncObservable<TRouterSubscribeState<TTypicalRouterData>>(routeState$);
    const routeTableState = useMemo(() => {
        if (isNil(routeState)) {
            return;
        }
        const paramValue = extractRouterParam(routeState.route, ETypicalSearchParams.TableState);
        if (isNil(paramValue)) {
            return;
        }

        return base64ToObject<TTableState>(paramValue as TBase64<TTableState>);
    }, [routeState]);

    const isMounted = useMountedState();
    const gridReady = useGridIsInitialized(gridApi);

    useGridApiEvent(
        gridApi,
        useDebouncedFunction(
            ({ type, source }: ColumnEvent<RecordType>) => {
                if (!gridReady || !isMounted() || isNil(colApi)) {
                    return;
                }

                // Flag manual column resize to prevent autosize
                if (type === Events.EVENT_COLUMN_RESIZED && isUserColumnAction(source)) {
                    logger.trace('set user resized', { type, source });
                    setUserResizedPersistentState(id, true);
                }

                // Autosize action should reset saved columns state
                if (
                    source === 'autosizeColumns' ||
                    source === 'sizeColumnsToFit' ||
                    source === 'flex'
                ) {
                    logger.trace('reset user resized', { type, source });
                    setUserResizedPersistentState(id, false);
                }

                // Any user-produced actions should save columns state
                const colState = colApi.getColumnState();
                // Since we're using deferred Grid API call
                // grid can be already destroyed when the call happens.
                // In this case `colState` will be `undefined` or columns set will be empty.
                if (!isEmpty(colState)) {
                    logger.trace('upsert persistent state');
                    upsertPersistentState(id, colState);
                }
            },
            UPSERT_DEBOUNCE_TIMEOUT,
            { leading: false, trailing: true },
        ),
        Events.EVENT_SORT_CHANGED,
        Events.EVENT_NEW_COLUMNS_LOADED,
        Events.EVENT_COLUMN_PIVOT_MODE_CHANGED,
        Events.EVENT_COLUMN_ROW_GROUP_CHANGED,
        Events.EVENT_COLUMN_PIVOT_CHANGED,
        Events.EVENT_GRID_COLUMNS_CHANGED,
        Events.EVENT_COLUMN_VALUE_CHANGED,
        Events.EVENT_COLUMN_MOVED,
        Events.EVENT_COLUMN_VISIBLE,
        Events.EVENT_COLUMN_PINNED,
        Events.EVENT_COLUMN_RESIZED,
        Events.EVENT_DISPLAYED_COLUMNS_CHANGED,
    );

    useGridColumnAutosize(gridApi, colApi, persistentTableState?.userResized ?? true);

    const cbRestoreLayout = useFunction(() => {
        if (!gridReady || isNil(colApi) || isUndefined(persistentTableState)) {
            return;
        }

        colApi.resetColumnState();
        logger.trace('reset columns state');

        // If URL has table state that belongs to this table, restore from URL
        if (!isNil(routeTableState) && routeTableState.id === id) {
            logger.trace('restore columns state from URL', {
                columns: routeTableState.columns?.length,
            });
            colApi.applyColumnState({
                state: routeTableState.columns,
                applyOrder: true,
            });

            // Reset
            void setRouteParams({
                [ETypicalSearchParams.TableState]: undefined,
            });
        } else if (!isNil(persistentTableState)) {
            logger.trace('restore columns state from persistent state', {
                columns: persistentTableState.columns?.length,
            });
            colApi.applyColumnState({
                state: persistentTableState.columns,
                applyOrder: true,
            });
        }
    });

    const cbRestoreAfterColumnChanges = useFunction((e: ColumnEvent<RecordType>) => {
        if (e.source === 'gridOptionsChanged') {
            cbRestoreLayout();
        }
    });

    const cbCopyTableState = useFunction(async () => {
        const base64State = !isNil(persistentTableState)
            ? objectToBase64(persistentTableState)
            : undefined;

        if (!isNil(routeState) && !isNil(base64State)) {
            const url = buildRouteUrl(routeState.route.name, {
                ...routeState.route.params,
                [ETypicalSearchParams.TableState]: base64State,
            });

            await clipboardWrite(url);

            success('Table State URL copied to clipboard');
        } else {
            error('Failed to construct Table State URL');
        }
    });

    useGridApiEvent(gridApi, cbRestoreAfterColumnChanges, Events.EVENT_COLUMN_RESIZED);

    useEffect(() => {
        if (gridReady) {
            logger.trace('first render');
            cbRestoreLayout();
        }
    }, [gridReady, cbRestoreLayout, logger]);

    return {
        state: persistentTableState ?? undefined,
        copyTableState: cbCopyTableState,
    };
}
