import type { TStageName } from '@backend/bff/src/def/stages.ts';
import type {
    TSubscribeToStmPositionsResponseRemovedPayload,
    TSubscribeToStmPositionsResponseUpdatedPayload,
} from '@backend/bff/src/modules/tradingDataProvider/schemas/SubscribeToStmPositions.schema.ts';
import hash_sum from 'hash-sum';
import { isEmpty, isNil } from 'lodash-es';
import { Observable, of } from 'rxjs';
import { concatMap } from 'rxjs/operators';

import { DEDUPE_REMOVE_DELAY, SHARE_RESET_DELAY } from '../../defs/observables.ts';
import type { TContextRef } from '../../di';
import type { TSocketStruct } from '../../types/domain/sockets.ts';
import { createObservableProcedure } from '../../utils/LPC/createObservableProcedure.ts';
import { mapValueDescriptor, scanValueDescriptor } from '../../utils/Rx/ValueDescriptor2.ts';
import { semanticHash } from '../../utils/semanticHash.ts';
import { UnifierWithCompositeHash } from '../../utils/unifierWithCompositeHash.ts';
import type { TValueDescriptor2 } from '../../utils/ValueDescriptor/types.ts';
import {
    createSyncedValueDescriptor,
    isSyncedValueDescriptor,
} from '../../utils/ValueDescriptor/utils.ts';
import { delayEmit, EDelayEmitType } from '../utils.ts';
import type {
    TFetchStmPositionsSnapshotResponsePayload,
    TStmPosition,
    TStmPositionFilter,
    TSubscribeToStmPositionsResponsePayload,
} from './defs.ts';
import { ModuleFetchStmPositionsSnapshot } from './fetchStmPositionsSnapshot.ts';
import { ModuleSubscribeToStmPositions } from './subscribeToStmPositions.ts';

export const ModuleStmPositions = createObservableProcedure(
    (ctx: TContextRef) => {
        const subscribeToStmPositions = ModuleSubscribeToStmPositions(ctx);
        const fetchStmPositionsSnapshot = ModuleFetchStmPositionsSnapshot(ctx);

        return (
            {
                bffSocket,
                requestStage,
                includeFilter,
            }: {
                bffSocket: TSocketStruct;
                requestStage: TStageName;
                includeFilter: TStmPositionFilter;
            },
            options,
        ): Observable<TValueDescriptor2<TStmPosition[]>> => {
            const includeBffFilter = isEmpty(includeFilter)
                ? undefined
                : {
                      virtualAccountId: isEmpty(includeFilter.virtualAccountIds)
                          ? undefined
                          : includeFilter.virtualAccountIds,
                      instrumentId: isEmpty(includeFilter.instrumentIds)
                          ? undefined
                          : includeFilter.instrumentIds,
                      robotId: isEmpty(includeFilter.robotIds) ? undefined : includeFilter.robotIds,
                      nonZeroPositions: includeFilter.nonZeroPositions,
                  };

            return subscribeToStmPositions(
                {
                    type: 'SubscribeToStmPositions',
                    target: bffSocket,
                    filters: { include: includeBffFilter },
                    requestStage,
                },
                options,
            ).pipe(
                mapValueDescriptor(({ value: { payload } }) =>
                    createSyncedValueDescriptor(payload),
                ),
                delayEmit<TValueDescriptor2<TSubscribeToStmPositionsResponsePayload>>((desc) => {
                    if (isSyncedValueDescriptor(desc)) {
                        return desc.value.type === 'StmPositionsSubscribed'
                            ? EDelayEmitType.Pass
                            : EDelayEmitType.Delay;
                    }

                    return EDelayEmitType.PassThrough;
                }),
                concatMap(
                    (
                        desc,
                    ): Observable<
                        TValueDescriptor2<
                            | TSubscribeToStmPositionsResponseUpdatedPayload
                            | TSubscribeToStmPositionsResponseRemovedPayload
                            | TFetchStmPositionsSnapshotResponsePayload
                        >
                    > =>
                        isSyncedValueDescriptor(desc) &&
                        desc.value.type === 'StmPositionsSubscribed'
                            ? fetchStmPositionsSnapshot(
                                  {
                                      type: 'FetchStmPositionsSnapshot',
                                      target: bffSocket,
                                      filters: { include: includeBffFilter },
                                      requestStage,
                                  },
                                  options,
                              ).pipe(
                                  mapValueDescriptor(({ value: { payload } }) =>
                                      createSyncedValueDescriptor(payload),
                                  ),
                              )
                            : of(
                                  desc as TValueDescriptor2<
                                      | TSubscribeToStmPositionsResponseUpdatedPayload
                                      | TSubscribeToStmPositionsResponseRemovedPayload
                                  >,
                              ),
                ),
                scanValueDescriptor(
                    (
                        acc: TValueDescriptor2<UnifierWithCompositeHash<TStmPosition>> | undefined,
                        { value },
                    ) => {
                        const cache =
                            acc?.value ??
                            new UnifierWithCompositeHash<TStmPosition>(
                                ['instrumentId', 'virtualAccountId'],
                                { removePredicate: (item) => isNil(item.platformTime) },
                            );

                        switch (value.type) {
                            case 'StmPositionsSnapshot':
                                cache.clear();
                                cache.modify(value.snapshot);
                                break;
                            case 'StmPositionsUpdated': {
                                cache.modify(value.updated);
                                break;
                            }
                            case 'StmPositionsRemoved': {
                                cache.modify(value.removed as TStmPosition[]);
                                break;
                            }
                        }

                        return createSyncedValueDescriptor(cache);
                    },
                ),
                mapValueDescriptor(({ value: cache }) =>
                    createSyncedValueDescriptor(cache.toArray()),
                ),
            );
        };
    },
    {
        dedobs: {
            removeDelay: DEDUPE_REMOVE_DELAY,
            resetDelay: SHARE_RESET_DELAY,
            normalize: ([props]) =>
                semanticHash.get(props, {
                    bffSocket: semanticHash.withHasher(hash_sum),
                    requestStage: semanticHash.withHasher(hash_sum),
                    includeFilter: {
                        instrumentIds: semanticHash.withSorter(null),
                        virtualAccountIds: semanticHash.withSorter(null),
                        robotIds: semanticHash.withSorter(null),
                        nonZeroPositions: semanticHash.withSorter(null),
                    },
                }),
        },
    },
);
