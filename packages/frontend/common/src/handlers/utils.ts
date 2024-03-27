import { isNil } from 'lodash-es';
import type { OperatorFunction } from 'rxjs';
import { filter, map, tap } from 'rxjs/operators';

import { TEnvelope, TReceivedData } from '../lib/BFFSocket/def';
import type { TIndicator, TIndicatorKey } from '../modules/actions/indicators/defs';
import { Nil } from '../types';
import { TBacktestingRunId } from '../types/domain/backtestings';
import type { TGate, TGateType } from '../types/domain/gates';
import { Milliseconds, Nanoseconds, TimeZone, TimeZoneList } from '../types/time';
import {
    createSubscribedEvent,
    createUpdateEvent,
    TSubscriptionEvent,
} from '../utils/Rx/subscriptionEvents';
import { mapValueDescriptor } from '../utils/Rx/ValueDescriptor2';
import { isISO, milliseconds2nanoseconds } from '../utils/time';
import { generateTraceId, TraceId } from '../utils/traceId';
import { logger } from '../utils/Tracing';
import { TValueDescriptor2 } from '../utils/ValueDescriptor/types';
import {
    createSyncedValueDescriptor,
    isSyncedValueDescriptor,
} from '../utils/ValueDescriptor/utils';
import type { SGate, TSubscribed, TWithSnapshot } from './def';

export function serverGateToGate(gate: SGate, type: TGateType): TGate {
    return { ...gate, type };
}

export function pollIntervalForRequest(pollInterval?: Milliseconds): Nanoseconds | undefined {
    if (isNil(pollInterval)) {
        return undefined;
    }

    return milliseconds2nanoseconds(pollInterval);
}

export function getTraceId<T extends { traceId?: TraceId }>(obj?: undefined | T): TraceId {
    return obj?.traceId ?? generateTraceId();
}

export function getIndicatorKey(
    url: TIndicator['url'],
    name: TIndicator['name'],
    backtestingRunId: Nil | TBacktestingRunId,
): TIndicatorKey {
    return `{${url}}.{${name}}.{${backtestingRunId || 0}}` as TIndicatorKey;
}

export function filterOutSubscribedMessage<T extends { type: string }>(): OperatorFunction<
    TReceivedData<T | TSubscribed>,
    TReceivedData<T>
> {
    return filter(
        (response: TReceivedData<T | TSubscribed>): response is TReceivedData<T> =>
            response.payload.type !== 'Subscribed',
    );
}

export function filterOutSubscribedValueDescriptor<T extends { type: string }>(): OperatorFunction<
    TValueDescriptor2<TReceivedData<T | TSubscribed>>,
    TValueDescriptor2<TReceivedData<T>>
> {
    return filter(
        (
            response: TValueDescriptor2<TReceivedData<T | TSubscribed>>,
        ): response is TValueDescriptor2<TReceivedData<T>> => {
            return (
                isSyncedValueDescriptor(response) && response.value.payload.type !== 'Subscribed'
            );
        },
    );
}

export function convertSubscribedToEmptyUpdate<T extends object>(
    emptyResponseBuilder: () => T,
): OperatorFunction<TReceivedData<T | TSubscribed>, TReceivedData<T>> {
    return map((response) =>
        'type' in response.payload && response.payload.type === 'Subscribed'
            ? ({
                  ...response,
                  payload: emptyResponseBuilder(),
              } as TReceivedData<T>)
            : (response as TReceivedData<T>),
    );
}

export function buildResponseWithEmptySnapshot<T extends TWithSnapshot>(
    main: Omit<T, keyof TWithSnapshot>,
): T {
    return {
        ...main,
        isSnapshot: false,
        startOfSnapshot: false,
        endOfSnapshot: false,
    } as T;
}

export function timeZone2TradingStatsTimeZone(timeZone: TimeZone): string {
    switch (timeZone) {
        case TimeZoneList.UTC:
            return 'Utc';
        case TimeZoneList.EuropeMoscow:
            return 'Msk';
        default:
            throw new Error(`Time zone "${timeZone}" is not supported on backend`);
    }
}

export function convertToSubscriptionEvent<P extends object, R>(
    getResult: (payload: Exclude<P, TSubscribed>) => R,
) {
    let subIndex = 0;

    return map<TReceivedData<P>, TSubscriptionEvent<R>>((envelope) =>
        'type' in envelope.payload &&
        'platformTime' in envelope.payload &&
        envelope.payload.type === 'Subscribed'
            ? createSubscribedEvent({
                  index: subIndex++,
                  platformTime: isISO(envelope.payload.platformTime)
                      ? envelope.payload.platformTime
                      : null,
              })
            : createUpdateEvent(getResult(envelope.payload as Exclude<P, TSubscribed>)),
    );
}

export function convertToSubscriptionEventValueDescriptor<P extends object, R>(
    getResult: (payload: Exclude<P, TSubscribed>) => R,
) {
    let subIndex = 0;

    return mapValueDescriptor<
        TValueDescriptor2<TReceivedData<P>>,
        TValueDescriptor2<TSubscriptionEvent<R>>
    >(({ value: envelope }) => {
        const value =
            'type' in envelope.payload &&
            'platformTime' in envelope.payload &&
            envelope.payload.type === 'Subscribed'
                ? createSubscribedEvent({
                      index: ++subIndex,
                      platformTime: isISO(envelope.payload.platformTime)
                          ? envelope.payload.platformTime
                          : null,
                  })
                : createUpdateEvent(getResult(envelope.payload as Exclude<P, TSubscribed>));

        return createSyncedValueDescriptor(value);
    });
}

export function logLargeExcessSoftLimitOperator<T extends TEnvelope<unknown>>(
    softLimit: number,
    getCount: (envelope: T) => number,
) {
    return tap<T>((envelope) => {
        const count = getCount(envelope);
        if (count > softLimit * 2) {
            logger.warn(`Soft limit ${softLimit} is too large compared to items count ${count}`, {
                traceId: envelope.traceId,
            });
        }
    });
}
