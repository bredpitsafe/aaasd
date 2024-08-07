import type { TraceId } from '@common/utils';
import { loggerCharter } from '@frontend/common/src/utils/Tracing/Children/Charter';
import type { Observable } from 'rxjs';
import { combineLatest, EMPTY, exhaustMap, from, interval, mergeMap, switchMap, take } from 'rxjs';
import { catchError, debounceTime, filter, groupBy, map } from 'rxjs/operators';

import type { TPart } from '../../../lib/Parts/def';
import type { IContext } from '../../types';
import { DELAYED_EMPTY, GROUP_TTL } from './defs';

export function createFailedPartsController$(
    ctx: IContext,
    reloadPart$: (part: TPart, traceId: TraceId) => Observable<unknown>,
): Observable<unknown> {
    return combineLatest([
        ctx.tickerController.isStarted$(),
        ctx.focusController.isFocusedWindow$,
        ctx.focusController.isFocusedApp$,
    ]).pipe(
        switchMap(([started, focusedWindow, focusedApp]) =>
            started ? interval(focusedApp ? 250 : focusedWindow ? 500 : 1000) : EMPTY,
        ),
        filter(() => ctx.viewportController.isVisible()),
        map(() => ctx.partsController.getAllFailedParts()),
        mergeMap((parts) => from(parts)),
        groupBy((part) => part.id, {
            duration: debounceTime(GROUP_TTL),
        }),
        mergeMap((group$) =>
            group$.pipe(
                take(1),
                exhaustMap((part) => {
                    loggerCharter.trace(`fill failed part`, { traceId: part.id });

                    return reloadPart$(part, part.id).pipe(catchError(() => DELAYED_EMPTY));
                }),
            ),
        ),
    );
}
