import { isFocusedWindow$ as _isFocusedWindow$ } from '@frontend/common/src/utils/observable/isFocusedWindow';
import { fromEvent, merge, shareReplay, Subject } from 'rxjs';
import { distinctUntilChanged, mapTo, startWith, takeUntil } from 'rxjs/operators';

import type { IContext } from '../types';

export type IFocusController = ReturnType<typeof createFocusController>;

export function createFocusController(ctx: IContext) {
    const destroy$ = new Subject<void>();
    const isFocusedWindow$ = _isFocusedWindow$.pipe(takeUntil(destroy$));
    const isFocusedApp$ = merge(
        fromEvent(ctx.targetView, 'mousemove').pipe(mapTo(true)),
        fromEvent(ctx.targetView, 'mouseout').pipe(mapTo(false)),
        fromEvent(ctx.targetView, 'mouseleave').pipe(mapTo(false)),
    ).pipe(startWith(false), distinctUntilChanged(), shareReplay(1), takeUntil(destroy$));

    return {
        destroy() {
            destroy$.next();
            destroy$.complete();
        },
        isFocusedApp$,
        isFocusedWindow$,
    };
}
