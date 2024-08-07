import { isNil } from 'lodash-es';
import type { Subscription } from 'rxjs';
import { fromEvent, merge } from 'rxjs';
import { filter, scan, switchMap, takeUntil, tap } from 'rxjs/operators';

import type { IChartViewport } from '../defs';
import { ViewportEvent } from '../defs';
import type { IPlugin } from './defs';

const EVENT_DRAG = 'user.drag';

type TDragOptions = {
    disableX?: boolean;
    disableY?: boolean;
};

export class DragPlugin implements IPlugin {
    static upsertOptions(viewport: IChartViewport, options: TDragOptions): void {
        return viewport.findPlugin(DragPlugin)?.upsertOptions(options);
    }

    private subscription: Subscription | undefined = undefined;

    constructor(
        private eventsElement: HTMLElement,
        private options: TDragOptions = {},
    ) {}

    upsertOptions(options: Partial<TDragOptions>): void {
        Object.assign(this.options, options);
    }

    connect(viewport: IChartViewport) {
        const move$ = fromEvent<MouseEvent>(this.eventsElement, 'mousemove').pipe(
            filter((event) => event.target === this.eventsElement),
            tap((event) => event.preventDefault()),
        );

        const start$ = fromEvent<MouseEvent>(this.eventsElement, 'mousedown').pipe(
            filter((event) => event.target === this.eventsElement),
            tap((event) => event.preventDefault()),
            tap(() => viewport.emit(ViewportEvent.StartUserAction)),
        );

        const stop$ = merge(
            fromEvent<MouseEvent>(this.eventsElement, 'mouseup'),
            fromEvent<MouseEvent>(this.eventsElement, 'mouseleave'),
            fromEvent<MouseEvent>(this.eventsElement, 'mouseout'),
        ).pipe(
            tap((event) => {
                if (!isNil(event) && event.target === this.eventsElement) {
                    event.preventDefault();
                }
            }),
            tap(() => viewport.emit(ViewportEvent.StopUserAction)),
        );

        this.subscription = start$
            .pipe(
                switchMap(() =>
                    move$.pipe(
                        scan(
                            (acc, event) => {
                                acc.x = this.options.disableX
                                    ? acc.x
                                    : viewport.getLeft() - event.movementX / viewport.scale.x;
                                acc.y = this.options.disableY
                                    ? acc.y
                                    : viewport.getTop() - event.movementY / viewport.scale.y;

                                return acc;
                            },
                            { x: viewport.getLeft(), y: viewport.getTop() },
                        ),
                        takeUntil(stop$),
                    ),
                ),
            )
            .subscribe((point) => {
                viewport.move(point.x, point.y, EVENT_DRAG);
            });
    }

    destroy() {
        this.subscription?.unsubscribe();
        // @ts-ignore
        this.eventsElement = undefined;
    }
}
