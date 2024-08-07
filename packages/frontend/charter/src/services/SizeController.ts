import { frameInterval } from '@frontend/common/src/utils/observable/frameTasks';
import type { Observable } from 'rxjs';
import { shareReplay, Subject } from 'rxjs';
import { distinctUntilChanged, filter, map, takeUntil } from 'rxjs/operators';

import { getState } from '../Charter/methods';
import type { IContext } from '../types';

type TSize = { width: number; height: number };

export class SizeController {
    private readonly destroyer$ = new Subject<void>();
    private readonly resize$: Observable<TSize>;

    constructor(ctx: IContext) {
        const state = getState(ctx);
        const { targetView, viewport, sharedRenderer, stage } = ctx;

        this.resize$ = frameInterval(10).pipe(
            map(() => targetView.parentElement),
            filter(
                (element): element is HTMLElement =>
                    element !== null && element.clientWidth > 0 && element.clientHeight > 0,
            ),
            map((element) => ({
                width: element.clientWidth,
                height: element.clientHeight,
            })),
            distinctUntilChanged(
                (prev, curr) =>
                    Math.abs(prev.width - curr.width) <= 1 &&
                    Math.abs(prev.height - curr.height) <= 1,
            ),
            shareReplay(1),
            takeUntil(this.destroyer$),
        );

        this.resize$.subscribe((size) => {
            state.screenWidth = size.width;
            state.screenHeight = size.height;

            targetView.width = size.width * devicePixelRatio;
            targetView.height = size.height * devicePixelRatio;
            targetView.style.width = `${size.width}px`;
            targetView.style.height = `${size.height}px`;

            viewport.resize(size.width, size.height);
            sharedRenderer.setStageSize(stage, size.width, size.height);
        });

        this.destroyer$.subscribe(() => {
            sharedRenderer.deleteStageSize(stage);
        });
    }

    getResize$(): Observable<TSize> {
        return this.resize$;
    }

    destroy(): void {
        this.destroyer$.next();
        this.destroyer$.complete();
    }
}
