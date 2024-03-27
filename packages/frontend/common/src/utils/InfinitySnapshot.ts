import { Observable, share, Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';

import { dedobs } from './observable/memo';
import { progressiveRetry } from './Rx/progressiveRetry';
import {
    isSubscriptionEventSubscribed,
    isSubscriptionEventUpdate,
    TSubscriptionEvent,
} from './Rx/subscriptionEvents';
import { mapValueDescriptor, tapValueDescriptor } from './Rx/ValueDescriptor2';
import { SnapshotStore } from './SnapshotStore';
import { generateTraceId, TraceId } from './traceId';
import { logger } from './Tracing';
import { loggerInfinitySnapshot } from './Tracing/Children/infinitySnapshot';
import { TValueDescriptor2 } from './ValueDescriptor/types';
import { createSyncedValueDescriptor } from './ValueDescriptor/utils';

export type TFetch<T> = (
    traceId: TraceId,
    offset: number,
    limit: number,
) => Observable<TValueDescriptor2<T[]>>;
export type TSubscribe<T> = (
    traceId: TraceId,
) => Observable<TValueDescriptor2<TSubscriptionEvent<T[]>>>;

export class InfinitySnapshot<T> {
    private fetch: TFetch<T>;
    private subscribe?: TSubscribe<T>;

    private getKey: (v: T) => string | number;
    // isDelete can be only in subscribe updates
    private sortPredicate: (a: T, b: T) => number;
    private deletePredicate: (item: T) => boolean;

    private keeper: SnapshotStore<T>;
    private maxCount = Infinity;
    private subscribeTraceId: undefined | TraceId;

    private destroy$ = new Subject<void>();
    private logger: typeof logger;

    constructor(props: {
        fetch: TFetch<T>;
        subscribe?: TSubscribe<T>;
        getKey: (v: T) => string | number;
        sortPredicate: (a: T, b: T) => number;
        deletePredicate?: (item: T) => boolean;
        logger?: typeof logger;
    }) {
        this.fetch = props.fetch;
        this.subscribe = props.subscribe;
        this.getKey = props.getKey;
        this.sortPredicate = props.sortPredicate;
        this.deletePredicate = props.deletePredicate ?? (() => false);
        this.logger = props.logger ?? loggerInfinitySnapshot;

        this.keeper = new SnapshotStore<T>(this.getKey, this.sortPredicate);

        if (this.subscribe !== undefined) {
            // We always need to have subscription to updates,
            // another way we will catch problems with cache invalidation
            this.subscribeToUpdates(generateTraceId())
                .pipe(progressiveRetry(), takeUntil(this.destroy$))
                .subscribe();
        }
    }

    destroy() {
        this.maxCount = Infinity;
        this.keeper.clear();
        this.destroy$.next();
        this.destroy$.complete();
    }

    getItems(
        traceId: TraceId,
        offset: number,
        seedCount: number,
    ): Observable<TValueDescriptor2<T[]>> {
        const { keeper, fetch } = this;

        return new Observable<TValueDescriptor2<number>>((subscriber) => {
            const count = Math.min(this.maxCount, offset + seedCount) - offset;

            if (keeper.isFilledSnapshotSlice(offset, count)) {
                subscriber.next(createSyncedValueDescriptor(count));
                subscriber.complete();
            } else {
                fetch(traceId, offset, seedCount)
                    .pipe(
                        tapValueDescriptor(({ value: items }) => {
                            this.addSnapshotItemsToKeeper(items);
                            if (seedCount > items.length) {
                                this.setMaxCount(offset + items.length);
                            }
                        }),
                        mapValueDescriptor(({ value: items }) =>
                            createSyncedValueDescriptor(items.length),
                        ),
                    )
                    .subscribe(subscriber);
            }
        }).pipe(
            mapValueDescriptor(({ value: count }) => {
                return createSyncedValueDescriptor(this.getItemsFromKeeper(offset, count));
            }),
        );
    }

    subscribeToUpdates = dedobs(
        (traceId: TraceId): Observable<TValueDescriptor2<TSubscriptionEvent<T[]>>> => {
            if (this.subscribe === undefined) {
                throw new Error(
                    '[InfinitySnapshot]: subscribeToUpdates is not allowed without subscribe function',
                );
            }

            this.subscribeTraceId = traceId;

            return this.subscribe(traceId).pipe(
                mapValueDescriptor(({ value: event }) => {
                    if (isSubscriptionEventSubscribed(event) && event.payload.index > 0) {
                        this.keeper.clear();
                    }
                    if (isSubscriptionEventUpdate(event)) {
                        this.upsertItemsToKeeper(event.payload);
                    }

                    return createSyncedValueDescriptor(event);
                }),
                finalize(() => {
                    this.subscribeTraceId = undefined;
                }),
                takeUntil(this.destroy$),
                share(),
            );
        },
        {
            normalize: ([traceId]) => {
                if (this.subscribeTraceId !== undefined) {
                    this.logger.info(
                        `subscribeToUpdates: traceId ${traceId} reuse observable with traceId ${this.subscribeTraceId}`,
                    );
                }

                return 0;
            },
        },
    );

    private setMaxCount(count: number) {
        this.maxCount = count;
    }

    private addSnapshotItemsToKeeper(items: T[]) {
        this.keeper.upsertSnapshotItems(items);
    }

    private upsertItemsToKeeper(items: T[]) {
        for (const item of items) {
            if (this.deletePredicate(item)) this.keeper.deleteItem(item);
            else this.keeper.upsertItem(item);
        }
        this.setMaxCount(Math.max(this.maxCount, this.keeper.getTotalSize()));
    }

    private getItemsFromKeeper(offset: number, count: number): T[] {
        return this.keeper.getSlice(offset, count);
    }
}
