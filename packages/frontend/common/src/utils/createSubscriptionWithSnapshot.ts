import { isNull } from 'lodash-es';
import {
    catchError,
    concat,
    EMPTY,
    mergeMap,
    Observable,
    of,
    startWith,
    Subject,
    switchMap,
    takeUntil,
    timer,
} from 'rxjs';

import { SHARE_RESET_DELAY } from '../defs/observables';
import { FailFactory, isFail, TFail } from '../types/Fail';
import { ISO } from '../types/time';
import { ValueDescriptor } from '../types/ValueDescriptor';
import { shareReplayWithDelayedReset } from './Rx/share';
import { isSubscriptionEventUpdate, TSubscriptionEvent } from './Rx/subscriptionEvents';
import { UnifierWithCompositeHash } from './unifierWithCompositeHash';
import { matchDesc, ValueDescriptorFactory } from './ValueDescriptor';

const SubscriptionWithSnapshotCreatorFail = FailFactory('createSubscriptionWithSnapshot');
const UNCAUGHT_EXCEPTION = SubscriptionWithSnapshotCreatorFail('UNCAUGHT_EXCEPTION');

export function createSubscriptionWithSnapshot<
    T extends object,
    SubscriptionErrors extends TFail<string>,
    FetchErrors extends TFail<string>,
    FinalErrors extends TFail<string>,
>({
    valueDescProducer,
    handleFetchError,
    handleSubscriptionError,
}: {
    valueDescProducer: ReturnType<typeof ValueDescriptorFactory<Array<T>, FinalErrors, null>>;
    handleSubscriptionError: (error: SubscriptionErrors | typeof UNCAUGHT_EXCEPTION) => {
        fail: FinalErrors;
        retryDelay: number | null;
    };
    handleFetchError: (error: FetchErrors | typeof UNCAUGHT_EXCEPTION) => {
        fail: FinalErrors | null;
        retryDelay: number | null;
    };
}) {
    return ({
        subscribe,
        fetch,
        cache,
    }: {
        subscribe: () => Observable<
            ValueDescriptor<TSubscriptionEvent<Array<T>>, SubscriptionErrors>
        >;
        fetch: (platformTime: ISO | null) => Observable<ValueDescriptor<Array<T>, FetchErrors>>;
        cache: UnifierWithCompositeHash<T>;
    }): Observable<ValueDescriptor<Array<T>, FinalErrors, null>> => {
        let hasFetched = false;
        const errorSubject = new Subject<void>();

        return subscribe().pipe(
            mergeMap((messageDesc) => {
                return matchDesc(messageDesc, {
                    idle: () => EMPTY,
                    unsynchronized: () => EMPTY,
                    synchronized: (tasksMessage) => {
                        if (isSubscriptionEventUpdate(tasksMessage)) {
                            cache.modify(tasksMessage.payload);
                            if (hasFetched) {
                                return of(valueDescProducer.sync(cache.toArray(), null));
                            }
                            return EMPTY;
                        }

                        hasFetched = false;
                        return fetch(tasksMessage.payload.platformTime).pipe(
                            mergeMap((resultDesc) =>
                                matchDesc(resultDesc, {
                                    idle: () => EMPTY,
                                    unsynchronized: () => EMPTY,
                                    synchronized: (tasks) => {
                                        cache.modify(tasks);
                                        hasFetched = true;
                                        return of(valueDescProducer.sync(cache.toArray(), null));
                                    },
                                    fail: (f) => {
                                        throw f;
                                    },
                                }),
                            ),
                            catchError((err, caught) => {
                                const innerFail = isFail(err)
                                    ? (err as FetchErrors)
                                    : UNCAUGHT_EXCEPTION;
                                const { fail, retryDelay } = handleFetchError(innerFail);
                                return concat(
                                    isNull(fail) ? EMPTY : of(valueDescProducer.fail(fail)),
                                    isNull(retryDelay)
                                        ? EMPTY
                                        : timer(retryDelay).pipe(switchMap(() => caught)),
                                );
                            }),
                            takeUntil(errorSubject),
                        );
                    },
                    fail: (f) => {
                        cache.clear();
                        errorSubject.next();
                        hasFetched = false;
                        throw f;
                    },
                });
            }),
            catchError((err, caught) => {
                const innerFail = isFail(err) ? (err as SubscriptionErrors) : UNCAUGHT_EXCEPTION;
                const { fail, retryDelay } = handleSubscriptionError(innerFail);
                return concat(
                    of(valueDescProducer.fail(fail)),
                    isNull(retryDelay) ? EMPTY : timer(retryDelay).pipe(switchMap(() => caught)),
                );
            }),
            startWith(valueDescProducer.unsc(null)),
            shareReplayWithDelayedReset(SHARE_RESET_DELAY),
        );
    };
}
