import type { TSubscriptionEvent } from '@common/rx';
import {
    createUpdateEvent,
    isSubscriptionEventRemove,
    isSubscriptionEventSubscribed,
    isSubscriptionEventUpdate,
} from '@common/rx';
import type { ISO } from '@common/types';
import { isNil } from 'lodash-es';
import type { Observable } from 'rxjs';
import { concat, of, throwError, timer } from 'rxjs';
import { catchError, concatMap, switchMap } from 'rxjs/operators';

import { delayEmit, EDelayEmitType } from './Rx/delayEmit';
import { distinctValueDescriptorUntilChanged, mapValueDescriptor } from './Rx/ValueDescriptor2';
import type { UnifierWithCompositeHash } from './unifierWithCompositeHash';
import { getCachedArrayFromUnifier } from './unifierWithCompositeHash';
import type { TGrpcFail, TValueDescriptor2 } from './ValueDescriptor/types';
import {
    createSyncedValueDescriptor,
    createUnsyncedValueDescriptor,
    isSyncedValueDescriptor,
} from './ValueDescriptor/utils';

export function createSubscriptionWithSnapshot2<T extends object, R extends object = T>({
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
        subscribe: () => Observable<TValueDescriptor2<TSubscriptionEvent<T[], R[]>>>;
        fetch: (platformTime: ISO | null) => Observable<TValueDescriptor2<T[]>>;
        cache: UnifierWithCompositeHash<T>;
    }): Observable<TValueDescriptor2<T[]>> => {
        const getData = () => getCachedArrayFromUnifier(cache);

        return subscribe().pipe(
            delayEmit((desc) => {
                if (isSyncedValueDescriptor(desc)) {
                    return isSubscriptionEventSubscribed(desc.value)
                        ? EDelayEmitType.Pass
                        : EDelayEmitType.Delay;
                }

                return EDelayEmitType.PassThrough;
            }),
            concatMap((desc) =>
                isSyncedValueDescriptor(desc) && isSubscriptionEventSubscribed(desc.value)
                    ? fetch(desc.value.payload.platformTime).pipe(
                          catchError((err, caught) => {
                              const handle = handleFetchError?.(err);

                              return isNil(handle)
                                  ? throwError(err)
                                  : concat(
                                        of(createUnsyncedValueDescriptor(handle.fail)),
                                        timer(handle.retryDelay).pipe(switchMap(() => caught)),
                                    );
                          }),
                          mapValueDescriptor(({ value }) => {
                              cache.clear();
                              return createSyncedValueDescriptor(createUpdateEvent<T[]>(value));
                          }),
                      )
                    : of(desc),
            ),
            catchError((err, caught) => {
                const handle = handleSubscriptionError?.(err);

                return isNil(handle)
                    ? throwError(err)
                    : concat(
                          of(createUnsyncedValueDescriptor(handle.fail)),
                          timer(handle.retryDelay).pipe(switchMap(() => caught)),
                      );
            }),
            mapValueDescriptor(({ value }) => {
                if (isSubscriptionEventUpdate(value) || isSubscriptionEventRemove(value)) {
                    // TODO: Actually, value.payload may be not T[], but R[] (which is usually a subset of T's keys).
                    // For now, let's just hope that cache's `removePredicate` method doesn't use missing fields.
                    cache.modify(value.payload as T[]);
                }

                return createSyncedValueDescriptor(getData());
            }),
            distinctValueDescriptorUntilChanged((a, b) => a === b),
        );
    };
}
