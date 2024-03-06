import type { ColumnApi, GridApi } from 'ag-grid-community';
import type { ColumnEvent } from 'ag-grid-community/dist/lib/events';
import { isNil } from 'lodash-es';
import { useEffect, useMemo, useRef } from 'react';
import { useMountedState } from 'react-use';

import { useModule } from '../../../di/react';
import { ModuleMessages } from '../../../lib/messages';
import type { ETableIds } from '../../../modules/clientTableFilters/data';
import { ModuleTypicalRouter } from '../../../modules/router';
import { ETypicalSearchParams } from '../../../modules/router/defs';
import { extractRouterParam } from '../../../modules/router/utils';
import { ModuleTableStates } from '../../../modules/tables';
import { TTableState } from '../../../modules/tables/data';
import { base64ToObject, objectToBase64, TBase64 } from '../../../utils/base64';
import { clipboardWrite } from '../../../utils/clipboard';
import { useDebouncedFunction } from '../../../utils/React/useDebouncedFunction';
import { useFunction } from '../../../utils/React/useFunction';
import { useSyncObservable } from '../../../utils/React/useSyncObservable';
import { applyAutoSize } from '../utils';
import { useGridApiEvent, useGridApiEventOnce } from './useGridApiEvent';

const UPSERT_DEBOUNCE_TIMEOUT = 1000;
const AUTOSIZE_DEBOUNCE_TIMEOUT = 50;

const COMMON_AUTOSIZE_EVENTS = ['rowGroupOpened', 'gridSizeChanged', 'gridColumnsChanged'];

const INFINITE_SCROLL_AUTOSIZE_EVENTS = ['firstInfinityRowReceived', ...COMMON_AUTOSIZE_EVENTS];
const NORMAL_AUTOSIZE_EVENTS = ['firstDataRendered', ...COMMON_AUTOSIZE_EVENTS];

type TUseGridStateReturnType = {
    state: TTableState | undefined;
    copyTableState: () => void;
};

export function useGridState<RecordType>(
    id: ETableIds,
    api: undefined | GridApi<RecordType>,
    colApi: undefined | ColumnApi,
    infiniteScroll = false,
): TUseGridStateReturnType {
    const { getState$, upsertState, setUserResizedState } = useModule(ModuleTableStates);
    const { success, error } = useModule(ModuleMessages);

    const { state$: routeState$, setParams, buildUrl } = useModule(ModuleTypicalRouter);

    // Local state
    const state$ = useMemo(() => getState$(id), [getState$, id]);
    const tableStateLocal = useSyncObservable(state$, undefined);

    // State from URL
    const state = useSyncObservable(routeState$);
    const tableStateURL = useMemo(() => {
        if (isNil(state)) {
            return;
        }
        const paramValue = extractRouterParam(state.route, ETypicalSearchParams.TableState);
        if (isNil(paramValue)) {
            return;
        }

        return base64ToObject<TTableState>(paramValue as TBase64<TTableState>);
    }, [state]);

    const isMounted = useMountedState();

    const cbColumnsStateChanged = useDebouncedFunction(
        (e: ColumnEvent<RecordType>) => {
            if (!isMounted() || !colApi) {
                return;
            }

            // Flag manual column resize to prevent autosize
            if (
                e.type === 'columnResized' &&
                (e.source === 'uiColumnResized' || e.source === 'uiColumnDragged')
            ) {
                setUserResizedState(id, true);
            }
            // Autosize action should reset saved columns state
            if (e.source === 'autosizeColumns' || e.source === 'sizeColumnsToFit') {
                setUserResizedState(id, false);
            }

            // Any user-produced actions should save columns state
            const colState = colApi.getColumnState();
            // Since we're using deferred Grid API call
            // grid can be already destroyed when the call happens.
            // In this case `colState` will be `undefined` or columns set will be empty.
            if (!isNil(colState) && colState.length > 0) {
                upsertState(id, colState);
            }
        },
        UPSERT_DEBOUNCE_TIMEOUT,
        { leading: false, trailing: true },
    );

    useGridApiEvent(
        api,
        cbColumnsStateChanged,
        'sortChanged',
        'columnResized',
        'columnPinned',
        'columnMoved',
        'columnVisible',
        'columnValueChanged',
        'gridColumnsChanged',
    );

    const cbAutosizeAll = useDebouncedFunction(
        () => {
            if (isNil(tableStateLocal) || tableStateLocal?.userResized || isNil(colApi)) {
                return;
            }

            applyAutoSize(colApi);
        },
        AUTOSIZE_DEBOUNCE_TIMEOUT,
        { leading: false, trailing: true },
    );

    const autoSizeEvents = useMemo(
        () => (infiniteScroll ? INFINITE_SCROLL_AUTOSIZE_EVENTS : NORMAL_AUTOSIZE_EVENTS),
        [infiniteScroll],
    );
    useGridApiEvent(api, cbAutosizeAll, ...autoSizeEvents);

    const autoSizeInfiniteScrollEvents = useMemo(
        () => (infiniteScroll ? ['paginationChanged'] : []),
        [infiniteScroll],
    );
    useGridApiEventOnce(api, cbAutosizeAll, ...autoSizeInfiniteScrollEvents);

    const hasInitialized = useRef<boolean>(false);

    useEffect(() => void (hasInitialized.current = false), [api, colApi]);

    const cbRestoreLayout = useFunction((): boolean => {
        if (isNil(colApi)) {
            return false;
        }

        colApi.resetColumnState();

        // If URL has table state that belongs to this table, restore from URL
        if (!isNil(tableStateURL) && tableStateURL.id === id) {
            colApi.applyColumnState({
                state: tableStateURL.columns,
                applyOrder: true,
            });

            // Reset
            void setParams({
                [ETypicalSearchParams.TableState]: undefined,
            });

            return true;
        }

        if (isNil(tableStateLocal)) {
            return false;
        }

        colApi.applyColumnState({
            state: tableStateLocal.columns,
            applyOrder: true,
        });

        return true;
    });

    const cbRestoreAfterColumnChanges = useFunction((e: ColumnEvent<RecordType>) => {
        if (e.source === 'gridOptionsChanged') {
            cbRestoreLayout();
        }
    });

    const cbCopyTableState = useFunction(async () => {
        const base64State = !isNil(tableStateLocal) ? objectToBase64(tableStateLocal) : undefined;
        if (!isNil(state) && !isNil(base64State)) {
            const url = buildUrl(state.route.name, {
                ...state.route.params,
                [ETypicalSearchParams.TableState]: base64State,
            });
            await clipboardWrite(url);
            success('Table State URL copied to clipboard');
            return;
        }
        error('Failed to construct Table State URL');
    });

    useGridApiEvent(api, cbRestoreAfterColumnChanges, 'columnResized');

    useEffect(() => {
        if (!hasInitialized.current) {
            hasInitialized.current = cbRestoreLayout();
        }
    }, [api, cbRestoreLayout, colApi, tableStateLocal]);

    return { state: tableStateLocal, copyTableState: cbCopyTableState };
}
