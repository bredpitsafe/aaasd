import type { TraceId } from '@common/utils';
import { generateTraceId, getNowISO } from '@common/utils';
import { invert, isObject } from 'lodash-es';
import type { Observable } from 'rxjs';
import { of, shareReplay } from 'rxjs';
import { filter, map, take } from 'rxjs/operators';

import { ModuleFactory } from '../../di';
import type { TEnvelope, TSendEnvelope, TSendPayload, WithPayload } from '../../lib/BFFSocket/def';
import type { TSocketName, TSocketStruct, TSocketURL } from '../../types/domain/sockets.ts';
import { type TSocketMap } from '../../types/domain/sockets.ts';
import { getRandomUint32 } from '../../utils/random';
import { ModuleSocketList } from '../socketList';

export function prepareEnvelopeToTracing(
    envelope: TEnvelope<WithPayload<unknown>>,
): TEnvelope<WithPayload<undefined>> {
    return {
        ...envelope,
        payload: undefined,
    };
}

export function createEnvelope<P extends TSendPayload>(
    payload: P,
    traceId?: TraceId,
    correlationId?: number,
): TSendEnvelope<P> {
    return {
        payload,
        traceId: traceId ?? generateTraceId(),
        correlationId: correlationId ?? generateCorrelationId(),
        timestamp: getNowISO(),
    };
}

export function generateCorrelationId(): number {
    return getRandomUint32();
}

export const ModuleGetSocketStruct = ModuleFactory((ctx) => {
    const { sockets$ } = ModuleSocketList(ctx);

    const mapUrlToName$ = sockets$.pipe(
        filter((sockets): sockets is TSocketMap => sockets !== undefined),
        map((sockets) => invert(sockets) as Record<TSocketURL, TSocketName>),
        shareReplay(1),
    );

    return (target: TSocketURL | TSocketStruct): Observable<TSocketStruct> => {
        return isObject(target)
            ? of(target as TSocketStruct)
            : mapUrlToName$.pipe(
                  map((mapUrlToName): TSocketStruct => {
                      return {
                          name: mapUrlToName[target as TSocketURL] ?? 'Unknown',
                          url: target,
                      };
                  }),
                  take(1),
              );
    };
});
