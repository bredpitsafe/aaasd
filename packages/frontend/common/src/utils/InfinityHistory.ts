import type { TSubscriptionEvent } from '@common/rx';
import { isSubscriptionEventSubscribed, isSubscriptionEventUpdate } from '@common/rx';
import type { ISO, Milliseconds } from '@common/types';
import type { TraceId } from '@common/utils';
import {
    compareDates,
    getNowISO,
    isClampedDates,
    isEqualDates,
    maxDate,
    minDate,
    toISO,
} from '@common/utils';
import { isUndefined } from 'lodash-es';
import type { Observable } from 'rxjs';
import { interval, of, Subject, throwError } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';

import { EMPTY_ARRAY } from './const';
import { dedobs } from './observable/memo';
import { mapValueDescriptor, switchMapValueDescriptor } from './Rx/ValueDescriptor2';
import { TimeseriesSliceManager } from './TimeseriesSliceManager';
import type { Slice } from './TimeseriesSliceManager/Slice';
import { TimeseriesSliceSquasherBySize } from './TimeseriesSliceManager/Squasher/SquasherBySize';
import { loggerInfinityHistory } from './Tracing/Children/InfinityHistory';
import type { TValueDescriptor2 } from './ValueDescriptor/types';
import { createSyncedValueDescriptor } from './ValueDescriptor/utils';

export type TFetch<T> = (
    traceId: TraceId,
    count: number,
    start: ISO,
    startInclude: boolean,
    end: ISO,
    endInclude: boolean,
) => Observable<TValueDescriptor2<T[]>>;
export type TSubscribe<T> = (
    traceId: TraceId,
) => Observable<TValueDescriptor2<TSubscriptionEvent<T[]>>>;

const MIN_ISO = toISO(0 as Milliseconds);
const MAX_ISO = toISO((10 * Date.now()) as Milliseconds);
const OPTIMAL_SLICE_SIZE = 100;

type FillEmptySlicesProps = {
    traceId: TraceId;
    count: number;
    rightBound: ISO;
    rightBoundInclude: boolean;
    leftBound: ISO;
    leftBoundInclude: boolean;
    directionMul: number;
};

export class InfinityHistory<T> {
    private fetch: TFetch<T>;
    private subscribe?: TSubscribe<T>;

    private keeper: TimeseriesSliceManager<T>;
    private squasher: TimeseriesSliceSquasherBySize;
    private destroy$ = new Subject<void>();
    private subscribeTraceId: undefined | TraceId;

    private getTime: (item: T) => ISO;

    private maxRequestCount: number;
    private usePseudoTimeNow: boolean;
    private pseudoTimeNow: ISO = toISO(0 as Milliseconds);
    private lastRealtimeItemTime: ISO = MAX_ISO;

    private sortItemsPredicate: (a: T, b: T) => number;

    constructor({
        getId,
        getTime,
        fetch,
        subscribe,
        maxRequestCount,
        usePseudoTimeNow = false,
    }: {
        getId: (item: T) => number | string;
        getTime: (item: T) => ISO;
        fetch: TFetch<T>;
        subscribe?: TSubscribe<T>;
        maxRequestCount?: number;
        usePseudoTimeNow?: boolean;
    }) {
        this.fetch = fetch;
        this.subscribe = subscribe;

        this.getTime = getTime;
        this.maxRequestCount = maxRequestCount ?? 1000;
        this.usePseudoTimeNow = usePseudoTimeNow;

        this.keeper = new TimeseriesSliceManager({ getId, getTime, logger: loggerInfinityHistory });
        this.squasher = new TimeseriesSliceSquasherBySize(this.keeper, OPTIMAL_SLICE_SIZE);
        this.sortItemsPredicate = (a: T, b: T) => compareDates(getTime(a), getTime(b));

        interval(30_000)
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => this.squasher.squash());
    }

    destroy() {
        this.keeper.clear();
        this.destroy$.next();
        this.destroy$.complete();
    }

    getItems(
        traceId: TraceId,
        seedCount: number,
        seedRightBound: ISO,
        seedLeftBound: ISO = MIN_ISO,
    ): Observable<TValueDescriptor2<T[]>> {
        const isForward = seedCount > 0;

        if (isForward) throw new Error('not implemented');
        if (seedCount === 0) return of(createSyncedValueDescriptor(EMPTY_ARRAY));

        return this.fillEmptySlices({
            traceId,
            count: Math.abs(seedCount),
            leftBound: seedLeftBound,
            leftBoundInclude: true,
            rightBound: minDate(seedRightBound, this.lastRealtimeItemTime),
            rightBoundInclude: true,
            directionMul: Math.sign(seedCount),
        }).pipe(
            mapValueDescriptor(() => {
                const items = this.keeper.getItems(seedCount, seedRightBound, seedLeftBound);
                return createSyncedValueDescriptor(isForward ? items : items.reverse());
            }),
        );
    }

    subscribeToUpdates = dedobs(
        (traceId: TraceId): Observable<TValueDescriptor2<TSubscriptionEvent<T[]>>> => {
            const { subscribe, getTime } = this;

            this.subscribeTraceId = traceId;

            let isFirstUpdate = true;

            if (subscribe === undefined) {
                return throwError(new Error('subscribe method is not defined for InfinityHistory'));
            }

            return subscribe(traceId).pipe(
                mapValueDescriptor(({ value: event }) => {
                    if (isSubscriptionEventSubscribed(event)) {
                        isFirstUpdate = true;
                    }
                    if (!isSubscriptionEventUpdate(event)) {
                        return createSyncedValueDescriptor(event);
                    }

                    const items = event.payload.sort(this.sortItemsPredicate);
                    const lastItem = items[items.length - 1];
                    const lastItemTime = getTime(lastItem);

                    this.insertRealtimeItems(traceId, isFirstUpdate, items);
                    isFirstUpdate = false;

                    this.updatePseudoTimeNow(lastItemTime);
                    this.updateLastRealtimeItemTime(lastItemTime);

                    return createSyncedValueDescriptor(event);
                }),
                finalize(() => {
                    this.subscribeTraceId = undefined;
                    this.resetLastRealtimeItemTime();
                }),
                takeUntil(this.destroy$),
            );
        },
        {
            normalize: ([traceId]) => {
                if (this.subscribeTraceId !== undefined) {
                    loggerInfinityHistory.info(
                        `subscribeToUpdates: traceId ${traceId} reuse observable with traceId ${this.subscribeTraceId}`,
                    );
                }

                return 0;
            },
            resetDelay: 0,
        },
    );

    private getTimeNow() {
        return this.usePseudoTimeNow ? this.pseudoTimeNow : getNowISO();
    }

    private updatePseudoTimeNow(v: ISO) {
        this.pseudoTimeNow = v;
    }

    private resetLastRealtimeItemTime() {
        this.lastRealtimeItemTime = MAX_ISO;
    }

    private updateLastRealtimeItemTime(v: ISO) {
        this.lastRealtimeItemTime = v;
    }

    private fillEmptySlices(
        props: FillEmptySlicesProps,
    ): Observable<TValueDescriptor2<FillEmptySlicesProps>> {
        if (props.directionMul > 0) {
            throw new Error('Not implemented');
        }

        if (props.count <= 0 || compareDates(props.leftBound, props.rightBound) >= 0) {
            return of(createSyncedValueDescriptor(props));
        }

        const [lastUnfilledSlice, passedItems] = getLastUnfilledSliceAndPassedItems(
            this.keeper.getSlices(props.directionMul * props.count, props.rightBound),
            props.rightBound,
        );

        const restCount = props.count - passedItems;

        if (lastUnfilledSlice === undefined) {
            return of(createSyncedValueDescriptor({ ...props, count: restCount }));
        }

        const leftBound = maxDate(toISO(lastUnfilledSlice.leftBound), props.leftBound);
        const rightBound = minDate(toISO(lastUnfilledSlice.rightBound), props.rightBound);

        if (compareDates(leftBound, rightBound) >= 0) {
            return of(createSyncedValueDescriptor({ ...props, count: restCount }));
        }

        const leftBoundInclude = isEqualDates(leftBound, lastUnfilledSlice.leftBound)
            ? lastUnfilledSlice.leftBoundInclude
            : props.leftBoundInclude;
        const rightBoundInclude = isEqualDates(rightBound, lastUnfilledSlice.rightBound)
            ? lastUnfilledSlice.rightBoundInclude
            : props.rightBoundInclude;
        const requestedCount = Math.min(restCount, this.maxRequestCount);

        return this.fetchItems(
            props.traceId,
            props.directionMul * requestedCount,
            rightBound,
            rightBoundInclude,
            leftBound,
            leftBoundInclude,
        ).pipe(
            mapValueDescriptor(({ value: items }) => {
                checkItemsInfinityLoop(items, requestedCount, this.getTime);

                const isHistoryRequest = compareDates(rightBound, this.getTimeNow()) <= 0;
                const _leftBound =
                    items.length >= requestedCount ? this.getTime(items[0]) : leftBound;
                const _leftBoundInclude = items.length >= requestedCount ? true : leftBoundInclude;
                const _rightBound = isHistoryRequest
                    ? rightBound
                    : items.length > 0
                      ? this.getTime(items[items.length - 1])
                      : undefined;
                const _rightBoundInclude = isHistoryRequest ? rightBoundInclude : true;

                if (items.length > 0 && !isUndefined(_rightBound)) {
                    this.insertHistoricalItems(
                        items,
                        _leftBound,
                        _rightBound,
                        _leftBoundInclude,
                        _rightBoundInclude,
                    );
                }

                return createSyncedValueDescriptor({
                    rightBound: _leftBound,
                    count: restCount - items.length,
                });
            }),
            switchMapValueDescriptor(({ value }) =>
                this.fillEmptySlices({
                    ...props,
                    count: value.count,
                    rightBound: value.rightBound,
                }),
            ),
        );
    }

    private fetchItems(
        traceId: TraceId,
        count: number,
        start: ISO,
        startInclude: boolean,
        end: ISO,
        endInclude: boolean,
    ) {
        return this.fetch(traceId, count, start, startInclude, end, endInclude).pipe(
            mapValueDescriptor(({ value }) => createSyncedValueDescriptor(value.reverse())),
            takeUntil(this.destroy$),
        );
    }

    private insertHistoricalItems(
        items: T[],
        leftBound: ISO,
        rightBound: ISO,
        leftBoundInclude: boolean,
        rightBoundInclude: boolean,
    ) {
        this.keeper.addItems(items, leftBound, rightBound, leftBoundInclude, rightBoundInclude);
        this.updatePseudoTimeNow(this.getTime(items[items.length - 1]));
    }

    private insertRealtimeItems(traceId: TraceId, isFirstPart: boolean, items: T[]) {
        const { getTime, keeper } = this;
        const firstItemTime = getTime(items[0]);
        const lastSlice = keeper.getSlices(1, firstItemTime)[0];

        if (lastSlice === undefined) {
            throw new Error('Slice is undefined');
        }

        if (isFirstPart) {
            keeper.addItems(items, firstItemTime);
        } else {
            const lastItem =
                lastSlice.isFilled() && lastSlice.items.length > 0
                    ? lastSlice.items[lastSlice.items.length - 1]
                    : undefined;
            const leftBound = lastItem === undefined ? lastSlice.leftBound : getTime(lastItem);

            if (compareDates(leftBound, firstItemTime) > 0) {
                loggerInfinityHistory.error(
                    `subscribeToUpdates: leftBound ${leftBound} > firstItemTime ${firstItemTime}`,
                    { traceId },
                );
            } else {
                keeper.addItems(items, minDate(leftBound, firstItemTime));
            }
        }
    }
}

function getLastUnfilledSliceAndPassedItems<T>(
    slices: Array<Slice<T>>,
    rightBound: ISO,
): [undefined | Slice<T>, number] {
    let passed = 0;
    for (let i = slices.length - 1; i >= 0; i--) {
        const slice = slices[i];

        if (compareDates(slice.leftBound, rightBound) >= 0) {
            continue;
        }

        if (slice.items === undefined) {
            return [slice, passed];
        }

        if (isClampedDates(rightBound, slice.leftBound, slice.rightBound)) {
            passed += slice.getClosestIndexBefore(rightBound) + 1;
        } else {
            passed += slice.items.length;
        }
    }

    return [undefined, passed];
}

function checkItemsInfinityLoop<T>(items: T[], length: number, getTime: (item: T) => ISO) {
    if (
        items.length === length &&
        isEqualDates(getTime(items[0]), getTime(items[items.length - 1]))
    ) {
        throw new Error('items with same time at first and last position create infinite loop');
    }
}
