import { assertFail } from '@common/utils/src/assert.ts';
import { isEqual, isFunction, isObject, isUndefined, noop } from 'lodash-es';
import type {
    MonoTypeOperatorFunction,
    Observable,
    ObservableInputTuple,
    OperatorFunction,
    Subscriber,
} from 'rxjs';
import { combineLatest, concat, EMPTY, of, pipe, throwError } from 'rxjs';
import { createOperatorSubscriber } from 'rxjs/internal/operators/OperatorSubscriber';
import { operate } from 'rxjs/internal/util/lift';
import {
    catchError,
    distinctUntilChanged,
    map,
    mergeMap,
    scan,
    switchMap,
    tap,
} from 'rxjs/operators';

import type { GrpcError } from '../../types/GrpcError';
import { throwingError } from '../throwingError';
import { convertErrToGrpcFail, findWorstFailIndex } from '../ValueDescriptor/Fails';
import type {
    ExtractSyncedValueDescriptor,
    ExtractSyncedValueDescriptorPayload,
    ExtractUnsyncedValueDescriptor,
    ExtractUnsyncedValueDescriptorPayload,
    ExtractValueDescriptorPayload,
    TUnsyncedValueDescriptor,
    TValueDescriptor2,
} from '../ValueDescriptor/types';
import type {
    TryConvertToValueDescriptor,
    ValueDescriptorHandler,
    ValueDescriptorHandlers,
} from '../ValueDescriptor/utils';
import {
    createSyncedValueDescriptor,
    createUnsyncedValueDescriptor,
    isEmptyValueDescriptor,
    isEqualValueDescriptor,
    isFailValueDescriptor,
    isLoadingValueDescriptor,
    isSyncedValueDescriptor,
    isUnsyncedValueDescriptor,
    matchValueDescriptor,
} from '../ValueDescriptor/utils';
import { failToError } from './failToError.ts';

export function scanValueDescriptor<VD extends TValueDescriptor2<any, any>, Acc>(
    handlers:
        | ((acc: undefined | Acc, vd: ExtractSyncedValueDescriptor<VD>) => Acc)
        | {
              synced: (acc: undefined | Acc, vd: ExtractSyncedValueDescriptor<VD>) => Acc;
              unsynced: (acc: undefined | Acc, vd: ExtractUnsyncedValueDescriptor<VD>) => Acc;
          },
): OperatorFunction<VD, Acc> {
    const synced = isFunction(handlers) ? handlers : handlers.synced;
    const unsynced = isFunction(handlers)
        ? (acc: unknown, vd: VD) => vd as unknown as Acc
        : handlers.unsynced;

    return scan<VD, Acc, undefined>((acc, vd): Acc => {
        switch (true) {
            case isSyncedValueDescriptor(vd):
                return synced(acc, vd);
            case isUnsyncedValueDescriptor(vd):
                return unsynced(acc, vd);
            default:
                assertFail();
        }
    }, undefined);
}

export function mapValueDescriptor<
    VD extends TValueDescriptor2<any, any>,
    Out1 = ExtractSyncedValueDescriptor<VD>,
    Out2 = ExtractUnsyncedValueDescriptor<VD>,
>(
    handlers: ValueDescriptorHandler<VD, Out1> | ValueDescriptorHandlers<VD, Out1, Out2>,
): OperatorFunction<VD, TryConvertToValueDescriptor<Out1, Out2>> {
    return map((d) => matchValueDescriptor(d, handlers));
}

export function switchMapValueDescriptor<
    VD extends TValueDescriptor2<any, any>,
    Out1 = ExtractSyncedValueDescriptor<VD>,
    Out2 = ExtractUnsyncedValueDescriptor<VD>,
>(
    handlers:
        | ValueDescriptorHandler<VD, Observable<Out1>>
        | ValueDescriptorHandlers<VD, Observable<Out1>, Observable<Out2>>,
): OperatorFunction<VD, TryConvertToValueDescriptor<Out1, Out2>> {
    const synced = isFunction(handlers) ? handlers : handlers.synced;
    const unsynced = isFunction(handlers) ? (vd: any): any => of(vd) : handlers.unsynced;

    return switchMap((d) => {
        return matchValueDescriptor(d, { synced, unsynced }) as Observable<
            TryConvertToValueDescriptor<Out1, Out2>
        >;
    });
}

export function mergeMapValueDescriptor<
    VD extends TValueDescriptor2<any, any>,
    Out1 = ExtractSyncedValueDescriptor<VD>,
    Out2 = ExtractUnsyncedValueDescriptor<VD>,
>(
    handlers:
        | ValueDescriptorHandler<VD, Observable<Out1>>
        | ValueDescriptorHandlers<VD, Observable<Out1>, Observable<Out2>>,
): OperatorFunction<VD, TryConvertToValueDescriptor<Out1, Out2>> {
    const synced = isFunction(handlers) ? handlers : handlers.synced;
    const unsynced = isFunction(handlers) ? (vd: any): any => of(vd) : handlers.unsynced;

    return mergeMap((d) => {
        return matchValueDescriptor(d, { synced, unsynced }) as Observable<
            TryConvertToValueDescriptor<Out1, Out2>
        >;
    });
}

export function distinctValueDescriptorUntilChanged<VD extends TValueDescriptor2<any, any>>(
    isEqualPayload: (
        a: ExtractValueDescriptorPayload<VD>,
        b: ExtractValueDescriptorPayload<VD>,
    ) => boolean = isEqual,
): MonoTypeOperatorFunction<VD> {
    return distinctUntilChanged((a, b) => isEqualValueDescriptor(a, b, isEqualPayload));
}

export function tapValueDescriptor<VD extends TValueDescriptor2<any, any>>(
    handlers: ValueDescriptorHandler<VD, any> | Partial<ValueDescriptorHandlers<VD, any, any>>,
): MonoTypeOperatorFunction<VD> {
    return tap((d) =>
        matchValueDescriptor(
            d,
            isFunction(handlers)
                ? handlers
                : {
                      synced: handlers.synced ?? noop,
                      unsynced: handlers.unsynced ?? noop,
                  },
        ),
    );
}

export function extractValueDescriptorFromError<T>() {
    return catchError<T, Observable<T>>((err: Error | GrpcError) => {
        return concat(
            of(createUnsyncedValueDescriptor(convertErrToGrpcFail(err)) as unknown as T),
            throwError(err),
        );
    });
}

export function extractSyncedValueFromValueDescriptor<
    VD extends TValueDescriptor2<any, any>,
    P extends ExtractSyncedValueDescriptorPayload<VD>,
>(): OperatorFunction<VD, P> {
    return mergeMapValueDescriptor<VD, P, never>({
        synced: ({ value }) => of(value),
        unsynced: () => EMPTY,
    });
}

type TExtractSyncedValueDescriptorPayloadArray<
    T extends readonly TValueDescriptor2<any, any>[] | Record<string, TValueDescriptor2<any, any>>,
> = T extends [...infer U]
    ? TValueDescriptor2<{ [K in keyof U]: ExtractSyncedValueDescriptorPayload<U[K]> }>
    : TValueDescriptor2<{ [K in keyof T]: ExtractSyncedValueDescriptorPayload<T[K]> }>;

export function squashValueDescriptors<
    T extends readonly TValueDescriptor2<any, any>[] | Record<string, TValueDescriptor2<any, any>>,
>(): OperatorFunction<T, TExtractSyncedValueDescriptorPayloadArray<T>> {
    return pipe(
        map((set) => {
            let arr: TValueDescriptor2<any, any>[];
            let keys: undefined | string[];

            if (Array.isArray(set)) {
                arr = set;
            } else if (isObject(set)) {
                arr = Object.values(set);
                keys = Object.keys(set);
            } else {
                throw new Error('squashValueDescriptors: invalid argument');
            }

            const result = squashList(arr);

            if (!isUndefined(keys) && isSyncedValueDescriptor(result)) {
                result.value = keys.reduce((acc, key, index) => {
                    acc[key] = arr[index].value;
                    return acc;
                }, {} as any);
            }

            return result as any;
        }),
        distinctValueDescriptorUntilChanged(() => false),
    );
}

export function squashList<T extends TValueDescriptor2<any, any>>(
    arr: T[],
): TValueDescriptor2<ExtractSyncedValueDescriptorPayload<T>[]> {
    if (arr.every(isSyncedValueDescriptor)) {
        return createSyncedValueDescriptor(arr.map((vd) => vd.value));
    }

    return findWorstUnsyncedValueDescriptor(arr) as TValueDescriptor2<
        ExtractSyncedValueDescriptorPayload<T>[]
    >;
}

export function findWorstUnsyncedValueDescriptor<T extends TValueDescriptor2<any, any>>(
    arr: T[],
): undefined | TUnsyncedValueDescriptor<ExtractUnsyncedValueDescriptorPayload<T>> {
    const unsynced = arr.filter(isUnsyncedValueDescriptor);

    if (arr.length === 0) {
        return undefined;
    }

    const withFail = unsynced.filter(isFailValueDescriptor);

    if (withFail.length > 0) {
        const index = findWorstFailIndex(withFail.map((vd) => vd.fail));
        return withFail[index];
    }

    return (
        unsynced.find(isLoadingValueDescriptor) ??
        unsynced.find(isEmptyValueDescriptor) ??
        throwingError('[findWorstValueDescriptor] Impossible case')
    );
}

export function takeWhileFirstSyncValueDescriptor<T extends TValueDescriptor2<any>>() {
    return operate((source: Observable<T>, subscriber: Subscriber<T>) => {
        let completed = false;
        source.subscribe(
            createOperatorSubscriber(subscriber, (value: T) => {
                const result = !isSyncedValueDescriptor(value);
                // It's extremely important to set `completed` flag *before* calling subscriber.next().
                // Otherwise, `next()` may create a sync call stack,
                // and we end up here on the next observable cycle never calling `subscriber.complete()`.
                if (!completed) {
                    if (!result) {
                        completed = true;
                    }
                    subscriber.next(value);
                }
                if (completed && !subscriber.closed) {
                    subscriber.complete();
                }
            }),
        );
    });
}
export function combineLatestValueDescriptors<A extends readonly TValueDescriptor2<any, any>[]>(
    sources: readonly [...ObservableInputTuple<A>],
): Observable<TExtractSyncedValueDescriptorPayloadArray<A>> {
    return combineLatest(sources).pipe(squashValueDescriptors<A>());
}

export function extractValueDescriptor<
    VD extends TValueDescriptor2<any, any>,
    P extends ExtractSyncedValueDescriptorPayload<VD>,
>(): OperatorFunction<VD, P> {
    return pipe(failToError<VD>(), extractSyncedValueFromValueDescriptor<VD, P>());
}
