import type { ColumnApi, GridApi } from 'ag-grid-community';
import type { ColumnEvent } from 'ag-grid-community/dist/lib/events';
import { isNil } from 'lodash-es';
import { useEffect, useMemo, useRef } from 'react';
import { useMountedState } from 'react-use';

import { useModule } from '../../../di/react';
import type { ETableIds } from '../../../modules/clientTableFilters/data';
import { ModuleTableStates } from '../../../modules/tables';
import { TTableState } from '../../../modules/tables/data';
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

type TUseLocalGridStateReturnType = {
    state: TTableState | undefined;
};

export function useLocalGridState<RecordType>(
    id: ETableIds,
    api: undefined | GridApi<RecordType>,
    colApi: undefined | ColumnApi,
    infiniteScroll = false,
): TUseLocalGridStateReturnType {
    const { getState$, upsertState, setUserResizedState } = useModule(ModuleTableStates);

    // Local state
    const state$ = useMemo(() => getState$(id), [getState$, id]);
    const state = useSyncObservable(state$, undefined);

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
            if (isNil(state) || state?.userResized || isNil(colApi)) {
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

        if (isNil(state)) {
            return false;
        }

        colApi.applyColumnState({
            state: state.columns,
            applyOrder: true,
        });

        return true;
    });

    const cbRestoreAfterColumnChanges = useFunction((e: ColumnEvent<RecordType>) => {
        if (e.source === 'gridOptionsChanged') {
            cbRestoreLayout();
        }
    });

    useGridApiEvent(api, cbRestoreAfterColumnChanges, 'columnResized');

    useEffect(() => {
        if (!hasInitialized.current) {
            hasInitialized.current = cbRestoreLayout();
        }
    }, [api, cbRestoreLayout, colApi, state]);

    return { state: state };
}
