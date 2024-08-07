import { receiveFromTabs, sendToTabs } from '@common/rx';
import type { Nanoseconds } from '@common/types';
import type { TimeseriesCharter } from '@frontend/charter/src';
import type {
    TBaseViewportEvent,
    TMeasureZoomHorizontalEvent,
} from '@frontend/charter/src/components/ChartViewport/defs';
import { ViewportEvent } from '@frontend/charter/src/components/ChartViewport/defs';
import { EVENT_AUTO_FOLLOW } from '@frontend/charter/src/plugins/AutoFollowViewport/def';
import type { IPlugin } from '@frontend/charter/src/plugins/Plugin';
import { isLastActiveTab$ } from '@frontend/common/src/utils/observable/isLastActiveTab';
import { throttleFrame } from '@frontend/common/src/utils/Rx/throttleFrame';
import { logger } from '@frontend/common/src/utils/Tracing';
import { isNil } from 'lodash-es';
import { EMPTY, fromEvent, merge, Subject } from 'rxjs';
import {
    filter,
    finalize,
    map,
    repeat,
    startWith,
    switchMap,
    take,
    takeUntil,
} from 'rxjs/operators';

import type { TSyncData, TUpdateData } from './defs';

const EVENT_SYNC = 'dashboard.sync';

export class SyncViewportPlugin implements IPlugin {
    private isEnabled = true;

    private hosts = new Set<TimeseriesCharter>();

    private syncData$ = new Subject<TSyncData>();
    private disconnect$ = new Subject<TimeseriesCharter>();
    private destroy$ = new Subject<void>();

    private readonly readyForSyncHosts = new WeakSet<TimeseriesCharter>();

    constructor(
        private channel: string,
        private seedUpdateData?: TUpdateData,
    ) {
        const updates = merge(
            this.syncData$,
            receiveFromTabs<TSyncData>(channel).pipe(filter(() => this.isEnabled)),
        );

        updates
            .pipe(
                take(1),
                switchMap((startUpdate) =>
                    updates.pipe(
                        startWith(startUpdate),
                        filter((update) => update.host === startUpdate.host),
                        throttleFrame(1, { leading: false, trailing: true }),
                        take(1),
                    ),
                ),
                repeat(),
                takeUntil(this.destroy$),
            )
            .subscribe((update) => {
                for (const destinationHost of this.hosts) {
                    if (update.host === destinationHost) {
                        continue;
                    }
                    syncHost(destinationHost, update);
                }
            });

        isLastActiveTab$
            .pipe(
                switchMap((active) =>
                    active
                        ? this.syncData$.pipe(
                              filter(() => this.isEnabled),
                              map((data) => ({ ...data, host: undefined })),
                              sendToTabs(channel),
                              takeUntil(this.destroy$),
                          )
                        : EMPTY,
                ),
            )
            .subscribe();
    }

    readyForSync(host: TimeseriesCharter): void {
        this.readyForSyncHosts.add(host);

        // Set seed update data only for first host
        if (this.seedUpdateData !== undefined) {
            this.syncData$.next(this.seedUpdateData);
            this.seedUpdateData = undefined;
        }
    }

    connect(host: TimeseriesCharter): void {
        this.hosts.add(host);

        this.connectMeasureStep(host);
        this.connectUpdateStep(host);
    }

    disconnect(host: TimeseriesCharter): void {
        this.disconnect$.next(host);
    }

    destroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
        this.hosts.clear();
    }

    isSyncing(host: TimeseriesCharter): boolean {
        return this.hosts.has(host);
    }

    disable(): void {
        this.isEnabled = false;
    }

    enable(): void {
        this.isEnabled = true;

        const host = this.hosts.values().next().value;

        if (!isNil(host)) {
            const viewport = host.getViewport();
            this.syncData$.next({
                host,
                clientTimeIncrement: host.getClientTimeIncrement(),
                left: viewport.getLeft(),
                right: viewport.getRight(),
            });
        }
    }

    private connectMeasureStep(host: TimeseriesCharter) {
        const viewport = host.getViewport();

        merge(fromEvent<TMeasureZoomHorizontalEvent>(viewport, ViewportEvent.TryZoomH))
            .pipe(
                takeUntil(this.disconnect$.pipe(filter((h) => h === host))),
                takeUntil(this.destroy$),
            )
            .subscribe((event) => this.limitHorizontalScale(event, host));
    }

    private limitHorizontalScale(event: TMeasureZoomHorizontalEvent, host: TimeseriesCharter) {
        const resultScale = {
            min: event.viewport.getMinScaleX(),
            max: event.viewport.getMaxScaleX(),
        };

        for (const destinationHost of this.hosts) {
            if (host === destinationHost) {
                continue;
            }

            const viewport = destinationHost.getViewport();

            const sizeCoefficient = event.viewport.screenWidth / viewport.screenWidth;

            const minScaleX = viewport.getMinScaleX();
            const maxScaleX = viewport.getMaxScaleX();

            const minScale = isNil(minScaleX) ? minScaleX : minScaleX * sizeCoefficient;
            const maxScale = isNil(maxScaleX) ? maxScaleX : maxScaleX * sizeCoefficient;

            if (
                (!isNil(minScale) && event.scale < minScale) ||
                (!isNil(maxScale) && event.scale > maxScale)
            ) {
                event.preventDefault();
            }

            resultScale.min =
                isNil(resultScale.min) || isNil(minScale)
                    ? resultScale.min ?? minScale
                    : Math.max(resultScale.min, minScale);
            resultScale.max =
                isNil(resultScale.max) || isNil(maxScale)
                    ? resultScale.max ?? maxScale
                    : Math.min(resultScale.max, maxScale);
        }

        if (!event.cancelled) {
            return;
        }

        const newScaleX = clamp(event.scale, resultScale.min, resultScale.max);

        if (isNil(newScaleX)) {
            logger.error(`Trying to set horizontal scale ${event.scale} which is not supported`);
            return;
        }

        event.viewport.setScaleX(newScaleX, event.zoomPoint, EVENT_SYNC);
    }

    private connectUpdateStep(host: TimeseriesCharter) {
        const viewport = host.getViewport();

        merge(
            fromEvent<TBaseViewportEvent>(viewport, ViewportEvent.ZoomH),
            fromEvent<TBaseViewportEvent>(viewport, ViewportEvent.MoveH),
        )
            .pipe(
                filter(
                    (event) =>
                        this.readyForSyncHosts.has(host) &&
                        event.type !== EVENT_SYNC &&
                        event.type !== EVENT_AUTO_FOLLOW,
                ),
                throttleFrame(1, { leading: false, trailing: true }),
                finalize(() => this.hosts.delete(host)),
                takeUntil(this.disconnect$.pipe(filter((h) => h === host))),
                takeUntil(this.destroy$),
            )
            .subscribe(() =>
                this.syncData$.next({
                    host,
                    clientTimeIncrement: host.getClientTimeIncrement(),
                    left: viewport.getLeft(),
                    right: viewport.getRight(),
                }),
            );
    }
}

function syncHost(
    host: TimeseriesCharter,
    { left, right, clientTimeIncrement }: TUpdateData,
): void {
    const viewport = host.getViewport();

    host.setClientTimeIncrement(clientTimeIncrement);

    viewport.setViewportLeftRight(left as Nanoseconds, right as Nanoseconds, EVENT_SYNC);
}

function clamp(value: number, min?: number | null, max?: number | null): number | null {
    if (!isNil(min) && !isNil(max) && min > max) {
        return null;
    }

    if (!isNil(min) && value < min) {
        return min;
    }

    if (!isNil(max) && value > max) {
        return max;
    }

    return value;
}
