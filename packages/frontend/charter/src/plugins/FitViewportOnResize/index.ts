import type { Nanoseconds } from '@common/types';
import { fromEvent, scan, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { ViewportEvent } from '../../components/ChartViewport/defs';
import type { TimeseriesCharter } from '../../index';
import type { IPlugin } from '../Plugin';

const RESIZE_EVENT = 'user.resized';

export class FitViewportOnResize implements IPlugin {
    destroy$ = new Subject<void>();

    connect(host: TimeseriesCharter): void {
        const viewport = host.getViewport();

        fromEvent(viewport, ViewportEvent.Resize)
            .pipe(
                scan(
                    ([, next]) => [next, viewport.screenWidth],
                    [viewport.screenWidth, viewport.screenWidth],
                ),
                takeUntil(this.destroy$),
            )
            .subscribe(([prevWidth, nextWidth]) => {
                if (nextWidth === 0 || prevWidth === 0) {
                    return;
                }

                const left = viewport.getLeft();
                const right = left + prevWidth / viewport.scale.x;

                viewport.emit(ViewportEvent.StartUserAction);

                viewport.setViewportLeftRight(
                    left as Nanoseconds,
                    right as Nanoseconds,
                    RESIZE_EVENT,
                );

                viewport.emit(ViewportEvent.StopUserAction);
            });
    }

    disconnect(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }
}
