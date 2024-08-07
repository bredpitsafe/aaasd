import type { WithMock } from '@backend/bff/src/def/mock';
import type { TStageName } from '@backend/bff/src/def/stages.ts';
import type { TStmKey } from '@backend/bff/src/modules/tradingDataProvider/schemas/SubscribeToStmPositions.schema';
import hash_sum from 'hash-sum';
import { get, isEmpty, isNil } from 'lodash-es';
import type { Observable } from 'rxjs';

import { DEDUPE_REMOVE_DELAY, SHARE_RESET_DELAY } from '../../defs/observables';
import type { TContextRef } from '../../di';
import type { TSocketStruct } from '../../types/domain/sockets';
import { Fail } from '../../types/Fail';
import { EGrpcErrorCode, GrpcError } from '../../types/GrpcError';
import { createSubscriptionWithSnapshot2 } from '../../utils/createSubscriptionWithSnapshot2';
import { createObservableProcedure } from '../../utils/LPC/createObservableProcedure';
import { semanticHash } from '../../utils/semanticHash';
import { UnifierWithCompositeHash } from '../../utils/unifierWithCompositeHash';
import type { TValueDescriptor2 } from '../../utils/ValueDescriptor/types';
import type { TStmBalance, TStmBalanceFilter } from './defs';
import { ModuleFetchStmBalancesSnapshot } from './fetchStmBalancesSnapshot';
import { ModuleSubscribeToStmBalances } from './subscribeToStmBalances';

const startSubscription = createSubscriptionWithSnapshot2<TStmBalance, TStmKey>({
    handleFetchError: (err: Error | GrpcError) => ({
        fail: Fail(err instanceof GrpcError ? err.code : EGrpcErrorCode.UNKNOWN, {
            message: err.message,
            description: get(err, 'description'),
        }),
        retryDelay: 2000,
    }),
    handleSubscriptionError: (err: Error | GrpcError) => ({
        fail: Fail(err instanceof GrpcError ? err.code : EGrpcErrorCode.UNKNOWN, {
            message: err.message,
            description: get(err, 'description'),
        }),
        retryDelay: 2000,
    }),
});

export const ModuleStmBalances = createObservableProcedure(
    (ctx: TContextRef) => {
        const subscribeToStmBalances = ModuleSubscribeToStmBalances(ctx);
        const fetchStmBalancesSnapshot = ModuleFetchStmBalancesSnapshot(ctx);

        return (
            {
                bffSocket,
                requestStage,
                includeFilter,
                mock,
            }: WithMock<{
                bffSocket: TSocketStruct;
                requestStage: TStageName;
                includeFilter: TStmBalanceFilter;
            }>,
            options,
        ): Observable<TValueDescriptor2<TStmBalance[]>> => {
            const includeBffFilter = isEmpty(includeFilter)
                ? undefined
                : {
                      virtualAccountId: includeFilter.virtualAccountIds ?? [],
                      instrumentId: includeFilter.instrumentIds ?? [],
                      robotId: includeFilter.robotIds ?? [],
                      assetId: includeFilter.assetIds ?? [],
                      nonZeroBalances: includeFilter.nonZeroBalances,
                  };

            const cache = new UnifierWithCompositeHash<TStmBalance>(
                ['instrumentId', 'virtualAccountId'],
                { removePredicate: (item) => isNil(item.platformTime) },
            );

            return startSubscription({
                cache,
                subscribe: () =>
                    subscribeToStmBalances(
                        {
                            type: 'SubscribeToStmBalances',
                            target: bffSocket,
                            filters: { include: includeBffFilter },
                            requestStage,
                            mock,
                        },
                        options,
                    ),
                fetch: () =>
                    fetchStmBalancesSnapshot(
                        {
                            type: 'FetchStmBalancesSnapshot',
                            target: bffSocket,
                            filters: { include: includeBffFilter },
                            requestStage,
                            mock,
                        },
                        options,
                    ),
            });
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
