import { isNil } from 'lodash-es';
import {
    catchError,
    concat,
    EMPTY,
    Observable,
    of,
    Subject,
    switchMap,
    takeUntil,
    throwError,
    timer,
} from 'rxjs';

import { ISO } from '../types/time';
import { isSubscriptionEventUpdate, TSubscriptionEvent } from './Rx/subscriptionEvents';
import {
    distinctValueDescriptorUntilChanged,
    mapValueDescriptor,
    mergeMapValueDescriptor,
} from './Rx/ValueDescriptor2';
import { getCachedArrayFromUnifier, UnifierWithCompositeHash } from './unifierWithCompositeHash';
import { TGrpcFail, TValueDescriptor2 } from './ValueDescriptor/types';
import {
    createSyncedValueDescriptor,
    createUnsyncedValueDescriptor,
} from './ValueDescriptor/utils';

export function createSubscriptionWithSnapshot2<T extends object>({
    handleFetchError,
    handleSubscriptionError,
}: {
    handleSubscriptionError?: (error: Error) => {
        fail: TGrpcFail;
        retryDelay: number;
    };
    handleFetchError?: (error: Error) => {
        fail: TGrpcFail;
        retryDelay: number;
    };
}) {
    return ({
        subscribe,
        fetch,
        cache,
    }: {
        subscribe: () => Observable<TValueDescriptor2<TSubscriptionEvent<T[]>>>;
        fetch: (platformTime: ISO | null) => Observable<TValueDescriptor2<T[]>>;
        cache: UnifierWithCompositeHash<T>;
    }): Observable<TValueDescriptor2<T[]>> => {
        let hasFetched = false;
        const getData = () => getCachedArrayFromUnifier(cache);
        const errorSubject = new Subject<void>();

        return subscribe().pipe(
            catchError((err, caught) => {
                const handle = handleSubscriptionError?.(err);

                return isNil(handle)
                    ? throwError(err)
                    : concat(
                          of(createUnsyncedValueDescriptor(handle.fail)),
                          timer(handle.retryDelay).pipe(switchMap(() => caught)),
                      );
            }),
            mergeMapValueDescriptor(({ value: subEvent }) => {
                if (isSubscriptionEventUpdate(subEvent)) {
                    cache.modify(subEvent.payload);
                    return hasFetched ? of(createSyncedValueDescriptor(getData())) : EMPTY;
                }

                hasFetched = false;
                return fetch(subEvent.payload.platformTime).pipe(
                    mapValueDescriptor(({ value }) => {
                        cache.modify(value);
                        hasFetched = true;
                        return createSyncedValueDescriptor(getData());
                    }),
                    catchError((err, caught) => {
                        const handle = handleFetchError?.(err);

                        return isNil(handle)
                            ? throwError(err)
                            : concat(
                                  of(createUnsyncedValueDescriptor(handle.fail)),
                                  timer(handle.retryDelay).pipe(switchMap(() => caught)),
                              );
                    }),
                    takeUntil(errorSubject),
                );
            }),
            distinctValueDescriptorUntilChanged((a, b) => a === b),
        );
    };
}
