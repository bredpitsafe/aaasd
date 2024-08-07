import { receiveFromTabs, sendToTabs } from '@common/rx';
import type { TimeseriesCharter } from '@frontend/charter/src';
import type { IPlugin } from '@frontend/charter/src/plugins/Plugin';
import type { TPoint } from '@frontend/common/src/types/shape';
import { finalize, fromEvent, merge, Subject } from 'rxjs';
import { filter, map, mapTo, takeUntil } from 'rxjs/operators';

const ZERO_POINT = {
    x: 0,
    y: 0,
};

export class SyncPseudoMouseCoordsPlugin implements IPlugin {
    private isEnabled = true;

    private hosts = new Set<TimeseriesCharter>();

    private syncData$ = new Subject<TPoint>();
    private disconnect$ = new Subject<TimeseriesCharter>();
    private destroy$ = new Subject<void>();

    constructor(private channel: string) {
        merge(this.syncData$, receiveFromTabs<TPoint>(channel).pipe(filter(() => this.isEnabled)))
            .pipe(takeUntil(this.destroy$))
            .subscribe((relPoint) => {
                this.hosts.forEach((target) => {
                    const size = target.getScreenSize();

                    target.setPseudoMouseCoords({
                        x: relPoint.x * size.width,
                        y: relPoint.y * size.height,
                    });
                });
            });

        this.syncData$
            .pipe(
                filter(() => this.isEnabled),
                map((data) => ({ ...data, host: undefined })),
                sendToTabs(channel),
                takeUntil(this.destroy$),
            )
            .subscribe();
    }

    connect(host: TimeseriesCharter): void {
        this.hosts.add(host);
        this.sync(host);
    }

    disconnect(host: TimeseriesCharter): void {
        this.disconnect$.next(host);
    }

    destroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
        this.hosts.clear();
    }

    private sync(host: TimeseriesCharter): void {
        const view = host.getView();
        const mousemove$ = fromEvent(view, 'mousemove', {
            passive: true,
        });
        const mouseleave$ = fromEvent(view, 'mouseleave', {
            passive: true,
        });

        merge(
            mousemove$.pipe(map(() => getRelativePoint(host))),
            mouseleave$.pipe(mapTo(ZERO_POINT)),
        )
            .pipe(
                finalize(() => this.hosts.delete(host)),
                takeUntil(this.disconnect$.pipe(filter((h) => h === host))),
                takeUntil(this.destroy$),
            )
            .subscribe((relPoint) => {
                this.syncData$.next(relPoint);
            });
    }

    disable(): void {
        this.isEnabled = false;
    }

    enable(): void {
        this.isEnabled = true;
    }
}

function getRelativePoint(host: TimeseriesCharter): TPoint {
    const point = host.getMouseCoords();
    const size = host.getScreenSize();

    return {
        x: point.x / size.width,
        y: point.y / size.height,
    };
}
