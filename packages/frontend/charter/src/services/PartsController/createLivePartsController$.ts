import type { TraceId } from '@common/utils';
import { loggerCharter } from '@frontend/common/src/utils/Tracing/Children/Charter';
import type { Observable } from 'rxjs';
import {
    combineLatest,
    EMPTY,
    exhaustMap,
    from,
    interval,
    mergeMap,
    of,
    switchMap,
    timer,
} from 'rxjs';
import { catchError, debounceTime, filter, groupBy, map } from 'rxjs/operators';

import type { TPart } from '../../../lib/Parts/def';
import { getLastAbsPointTime } from '../../../lib/Parts/utils/point';
import type { IContext } from '../../types';
import { DELAYED_EMPTY, GROUP_TTL } from './defs';

export function createLivePartsController$(
    ctx: IContext,
    fillPart$: (part: TPart, traceId: TraceId) => Observable<unknown>,
): Observable<unknown> {
    return combineLatest([
        ctx.tickerController.isStarted$(),
        ctx.focusController.isFocusedWindow$,
    ]).pipe(
        switchMap(([started, focused]) => (started ? interval(focused ? 250 : 1000) : EMPTY)),
        filter(() => ctx.viewportController.isVisible()),
        map(() => ctx.partsController.getAllLiveParts()),
        mergeMap((parts) => from(parts)),
        groupBy((part) => part.id, {
            duration: debounceTime(GROUP_TTL),
        }),
        mergeMap((group$) => {
            return group$.pipe(
                exhaustMap((part) => {
                    return of(shouldUpdateLivePartImmediately(part) ? part : timer(3_000)).pipe(
                        mergeMap(() => {
                            loggerCharter.trace(`load live parts`, {
                                partId: part.id,
                                interval: part.interval,
                                pixelSize: part.pixelSize,
                                traceId: part.id,
                            });

                            return fillPart$(part, part.id).pipe(catchError(() => DELAYED_EMPTY));
                        }),
                    );
                }),
            );
        }),
    );

    function shouldUpdateLivePartImmediately(part: TPart): boolean {
        const {
            viewport,
            state: { clientTimeIncrement },
        } = ctx;
        const lastPointTime = getLastAbsPointTime(part) || part.interval[0];
        const right = clientTimeIncrement + viewport.getRight();
        const gap = (part.interval[1] - part.interval[0]) * 0.15;

        return lastPointTime <= right + gap;
    }
}
