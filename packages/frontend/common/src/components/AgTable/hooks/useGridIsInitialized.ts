import type { ComponentStateChangedEvent, GridApi } from '@frontend/ag-grid';
import { Events } from '@frontend/ag-grid';
import { isNil } from 'lodash-es';
import { useMemo } from 'react';
import type { Observable } from 'rxjs';
import { EMPTY, interval } from 'rxjs';
import { filter, map, mergeWith, take } from 'rxjs/operators';

import { useSyncObservable } from '../../../utils/React/useSyncObservable';
import { fromAgGridEvent } from '../utils.ts';

export function useGridIsInitialized<RecordType>(
    gridApi: GridApi<RecordType> | undefined,
): boolean {
    return (
        useSyncObservable(
            useMemo<Observable<boolean>>(
                () =>
                    isNil(gridApi)
                        ? EMPTY
                        : fromAgGridEvent<RecordType, ComponentStateChangedEvent<RecordType>>(
                              gridApi,
                              Events.EVENT_COMPONENT_STATE_CHANGED,
                          ).pipe(
                              mergeWith(
                                  // EVENT_COMPONENT_STATE_CHANGED can be omitted by some reason so we do fallback by checking AgGrid inner tasks queue
                                  interval(100).pipe(
                                      map(() => gridApi.isAnimationFrameQueueEmpty()),
                                      filter((isQueueEmpty) => isQueueEmpty),
                                  ),
                              ),
                              map(() => true),
                              take(1),
                          ),
                [gridApi],
            ),
        ) ?? false
    );
}
