import type { WithMock } from '@backend/bff/src/def/mock.ts';
import type { TInstrumentRevision } from '@backend/bff/src/modules/instruments/schemas/defs.ts';
import type { TSubscribeToInstrumentRevisionsResponsePayload } from '@backend/bff/src/modules/instruments/schemas/SubscribeToInstrumentRevisions.schema.ts';
import type { TSubscriptionEvent } from '@common/rx';
import { createSubscribedEvent, createUpdateEvent } from '@common/rx';
import type { ISO } from '@common/types';
import { getNowISO, isISO } from '@common/utils';
import { get, orderBy } from 'lodash-es';

import { DEDUPE_REMOVE_DELAY, SHARE_RESET_DELAY } from '../../defs/observables.ts';
import type { TReceivedData } from '../../lib/BFFSocket/def.ts';
import type { TSocketStruct } from '../../types/domain/sockets.ts';
import { Fail } from '../../types/Fail.ts';
import { EGrpcErrorCode, GrpcError } from '../../types/GrpcError.ts';
import { createSubscriptionWithSnapshot2 } from '../../utils/createSubscriptionWithSnapshot2.ts';
import { getSocketUrlHash } from '../../utils/hash/getSocketUrlHash.ts';
import { createObservableProcedure } from '../../utils/LPC/createObservableProcedure.ts';
import { mapValueDescriptor } from '../../utils/Rx/ValueDescriptor2';
import { semanticHash } from '../../utils/semanticHash.ts';
import { UnifierWithCompositeHash } from '../../utils/unifierWithCompositeHash.ts';
import type { TValueDescriptor2 } from '../../utils/ValueDescriptor/types.ts';
import { createSyncedValueDescriptor } from '../../utils/ValueDescriptor/utils';
import { DEFAULT_RETRY_DELAY } from '../actions/def.ts';
import { ModuleFetchInstrumentRevisions } from './ModuleFetchInstrumentRevisions.ts';
import { ModuleSubscribeToInstrumentRevisions } from './ModuleSubscribeToInstrumentRevisions.ts';

// TODO: We need full revisions list for selector, later we will have Options service
const MAX_REVISIONS_COUNT = 100;

const startSubscription = createSubscriptionWithSnapshot2<TInstrumentRevision>({
    handleFetchError: (err: Error | GrpcError) => ({
        fail: Fail(err instanceof GrpcError ? err.code : EGrpcErrorCode.UNKNOWN, {
            message: err.message,
            description: get(err, 'description'),
        }),
        retryDelay: DEFAULT_RETRY_DELAY,
    }),
    handleSubscriptionError: (err: Error | GrpcError) => ({
        fail: Fail(err instanceof GrpcError ? err.code : EGrpcErrorCode.UNKNOWN, {
            message: err.message,
            description: get(err, 'description'),
        }),
        retryDelay: DEFAULT_RETRY_DELAY,
    }),
});

export const ModuleSubscribeToInstrumentRevisionsWithSnapshot = createObservableProcedure(
    (ctx) => {
        const fetch = ModuleFetchInstrumentRevisions(ctx);
        const subscribe = ModuleSubscribeToInstrumentRevisions(ctx);

        return (
            params: WithMock<{
                instrumentId: number;
                target: TSocketStruct;
                snapshotDepth?: number;
            }>,
            options,
        ) => {
            const cache = new UnifierWithCompositeHash<TInstrumentRevision>([
                'instrumentId',
                'platformTime',
            ]);

            return startSubscription({
                cache,
                subscribe: () =>
                    subscribe(
                        {
                            target: params.target,
                            filter: { instrumentIds: [params.instrumentId] },
                            mock: params.mock,
                        },
                        options,
                    ).pipe(convertToSubscriptionEventValueDescriptor()),
                fetch: (platformTime: ISO | null) =>
                    fetch(
                        {
                            target: params.target,
                            filter: { instrumentId: params.instrumentId },
                            pagination: {
                                platformTime: platformTime ?? getNowISO(),
                                direction: 'TIME_DIRECTION_BACKWARD',
                                softLimit: params.snapshotDepth ?? MAX_REVISIONS_COUNT,
                            },
                            mock: params.mock,
                        },
                        options,
                    ).pipe(
                        mapValueDescriptor(({ value }) =>
                            createSyncedValueDescriptor(value.payload.snapshot),
                        ),
                    ),
            }).pipe(
                mapValueDescriptor(({ value }) => {
                    return createSyncedValueDescriptor(
                        orderBy(value, ({ platformTime }) => platformTime, ['desc']),
                    );
                }),
            );
        };
    },
    {
        dedobs: {
            normalize: ([params]) =>
                semanticHash.get(params, { target: semanticHash.withHasher(getSocketUrlHash) }),
            resetDelay: SHARE_RESET_DELAY,
            removeDelay: DEDUPE_REMOVE_DELAY,
        },
    },
);

function convertToSubscriptionEventValueDescriptor() {
    let subIndex = 0;

    return mapValueDescriptor<
        TValueDescriptor2<TReceivedData<TSubscribeToInstrumentRevisionsResponsePayload>>,
        TValueDescriptor2<TSubscriptionEvent<TInstrumentRevision[]>>
    >(({ value }) =>
        createSyncedValueDescriptor(
            value.payload.type === 'Ok'
                ? createSubscribedEvent({
                      index: ++subIndex,
                      platformTime: isISO(value.payload.platformTime)
                          ? value.payload.platformTime
                          : null,
                  })
                : createUpdateEvent(value.payload.upserted ?? []),
        ),
    );
}
