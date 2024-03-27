import type { TStageName } from '@backend/bff/src/def/stages.ts';
import type {
    TSubscribeToStmBalancesResponseRemovedPayload,
    TSubscribeToStmBalancesResponseUpdatedPayload,
} from '@backend/bff/src/modules/tradingDataProvider/schemas/SubscribeToStmBalances.schema.ts';
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
    TFetchStmBalancesSnapshotResponsePayload,
    TStmBalance,
    TStmBalanceFilter,
} from './defs.ts';
import { ModuleFetchStmBalancesSnapshot } from './fetchStmBalancesSnapshot.ts';
import { ModuleSubscribeToStmBalances } from './subscribeToStmBalances.ts';

export const ModuleStmBalances = createObservableProcedure(
    (ctx: TContextRef) => {
        const subscribeToStmBalances = ModuleSubscribeToStmBalances(ctx);
        const fetchStmBalancesSnapshot = ModuleFetchStmBalancesSnapshot(ctx);

        return (
            {
                bffSocket,
                requestStage,
                includeFilter,
            }: {
                bffSocket: TSocketStruct;
                requestStage: TStageName;
                includeFilter: TStmBalanceFilter;
            },
            options,
        ): Observable<TValueDescriptor2<TStmBalance[]>> => {
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
                      assetId: isEmpty(includeFilter.assetIds) ? undefined : includeFilter.assetIds,
                      nonZeroBalances: includeFilter.nonZeroBalances,
                  };

            return subscribeToStmBalances(
                {
                    type: 'SubscribeToStmBalances',
                    target: bffSocket,
                    filters: { include: includeBffFilter },
                    requestStage,
                },
                options,
            ).pipe(
                mapValueDescriptor(({ value: { payload } }) =>
                    createSyncedValueDescriptor(payload),
                ),
                delayEmit((desc) => {
                    if (isSyncedValueDescriptor(desc)) {
                        return desc.value.type === 'StmBalancesSubscribed'
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
                            | TSubscribeToStmBalancesResponseUpdatedPayload
                            | TSubscribeToStmBalancesResponseRemovedPayload
                            | TFetchStmBalancesSnapshotResponsePayload
                        >
                    > =>
                        isSyncedValueDescriptor(desc) && desc.value.type === 'StmBalancesSubscribed'
                            ? fetchStmBalancesSnapshot(
                                  {
                                      type: 'FetchStmBalancesSnapshot',
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
                                      | TSubscribeToStmBalancesResponseUpdatedPayload
                                      | TSubscribeToStmBalancesResponseRemovedPayload
                                  >,
                              ),
                ),
                scanValueDescriptor(
                    (
                        acc: TValueDescriptor2<UnifierWithCompositeHash<TStmBalance>> | undefined,
                        { value },
                    ) => {
                        const cache =
                            acc?.value ??
                            new UnifierWithCompositeHash<TStmBalance>(
                                ['instrumentId', 'virtualAccountId'],
                                { removePredicate: (item) => isNil(item.platformTime) },
                            );

                        switch (value.type) {
                            case 'StmBalancesSnapshot':
                                cache.clear();
                                cache.modify(value.snapshot);
                                break;
                            case 'StmBalancesUpdated': {
                                cache.modify(value.updated);
                                break;
                            }
                            case 'StmBalancesRemoved': {
                                cache.modify(value.removed as TStmBalance[]);
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
                        assetIds: semanticHash.withSorter(null),
                        nonZeroBalances: semanticHash.withSorter(null),
                    },
                }),
        },
    },
);
