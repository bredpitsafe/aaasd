import type { TSubscriptionEvent } from '@common/rx';
import { createSubscribedEvent, createUpdateEvent } from '@common/rx';
import type { Milliseconds, Nanoseconds, Nil, TimeZone } from '@common/types';
import { TimeZoneList } from '@common/types';
import type { TraceId } from '@common/utils';
import { generateTraceId, isISO, milliseconds2nanoseconds } from '@common/utils';
import { isNil } from 'lodash-es';
import type { OperatorFunction } from 'rxjs';
import { filter } from 'rxjs/operators';

import type { TReceivedData } from '../../lib/BFFSocket/def.ts';
import type { TBacktestingRunId } from '../../types/domain/backtestings.ts';
import type { TGate, TGateType } from '../../types/domain/gates.ts';
import { mapValueDescriptor } from '../../utils/Rx/ValueDescriptor2.ts';
import type { TValueDescriptor2 } from '../../utils/ValueDescriptor/types.ts';
import {
    createSyncedValueDescriptor,
    isSyncedValueDescriptor,
} from '../../utils/ValueDescriptor/utils.ts';
import type { SGate, TSubscribed } from './def.ts';
import type { TIndicator, TIndicatorKey } from './indicators/defs.ts';

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

export function timeZone2UtcOrMskTimeZone(timeZone: TimeZone): string {
    switch (timeZone) {
        case TimeZoneList.UTC:
            return 'Utc';
        case TimeZoneList.EuropeMoscow:
            return 'Msk';
        default:
            throw new Error(`Time zone "${timeZone}" is not supported on backend`);
    }
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
            'type' in envelope.payload && envelope.payload.type === 'Subscribed'
                ? createSubscribedEvent({
                      index: ++subIndex,
                      platformTime:
                          'platformTime' in envelope.payload
                              ? isISO(envelope.payload.platformTime)
                                  ? envelope.payload.platformTime
                                  : null
                              : null,
                  })
                : createUpdateEvent(getResult(envelope.payload as Exclude<P, TSubscribed>));

        return createSyncedValueDescriptor(value);
    });
}
