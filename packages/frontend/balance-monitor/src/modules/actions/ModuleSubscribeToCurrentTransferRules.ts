import { isSubscriptionEventSubscribed } from '@common/rx';
import { DEDUPE_REMOVE_DELAY, SHARE_RESET_DELAY } from '@frontend/common/src/defs/observables.ts';
import type { TContextRef } from '@frontend/common/src/di';
import { ModuleSocketPage } from '@frontend/common/src/modules/socketPage';
import type { TTransferBlockingRuleInfo } from '@frontend/common/src/types/domain/balanceMonitor/defs.ts';
import type { TSocketURL } from '@frontend/common/src/types/domain/sockets.ts';
import { createObservableProcedure } from '@frontend/common/src/utils/LPC/createObservableProcedure.ts';
import { constantNormalizer } from '@frontend/common/src/utils/observable/memo.ts';
import { bufferTimeValueDescriptor } from '@frontend/common/src/utils/Rx/bufferTimeValueDescriptor.ts';
import {
    mapValueDescriptor,
    scanValueDescriptor,
} from '@frontend/common/src/utils/Rx/ValueDescriptor2.ts';
import { UpdatableUnifierWithCompositeHash } from '@frontend/common/src/utils/UpdatableUnifierWithCompositeHash.ts';
import type { TValueDescriptor2 } from '@frontend/common/src/utils/ValueDescriptor/types.ts';
import { createSyncedValueDescriptor } from '@frontend/common/src/utils/ValueDescriptor/utils.ts';
import type { Observable } from 'rxjs';
import { filter, switchMap } from 'rxjs/operators';

import { BUFFER_INTERVAL } from './defs.ts';
import { ModuleSubscribeToTransferRules } from './ModuleSubscribeToTransferRules.ts';

export type TTransfersBlockingRulesDescriptor = TValueDescriptor2<TTransferBlockingRuleInfo[]>;

export const ModuleSubscribeToCurrentTransferRules = createObservableProcedure(
    (ctx: TContextRef) => {
        const subscribeToTransferRules = ModuleSubscribeToTransferRules(ctx);
        const { currentSocketUrl$ } = ModuleSocketPage(ctx);

        return (_, options): Observable<TTransfersBlockingRulesDescriptor> => {
            return currentSocketUrl$.pipe(
                filter((url): url is TSocketURL => url !== undefined),
                switchMap((target) =>
                    subscribeToTransferRules(
                        { target },
                        { ...options, skipAuthentication: false },
                    ).pipe(
                        bufferTimeValueDescriptor(BUFFER_INTERVAL),
                        scanValueDescriptor(
                            (
                                acc:
                                    | undefined
                                    | TValueDescriptor2<
                                          UpdatableUnifierWithCompositeHash<
                                              TTransferBlockingRuleInfo,
                                              'id'
                                          >
                                      >,
                                { value: events },
                            ) => {
                                const cache =
                                    acc?.value ??
                                    new UpdatableUnifierWithCompositeHash<
                                        TTransferBlockingRuleInfo,
                                        'id'
                                    >('id');

                                for (const event of events) {
                                    if (isSubscriptionEventSubscribed(event)) {
                                        cache.clear();
                                    } else {
                                        const { type } = event.payload;

                                        switch (type) {
                                            case 'TransferRuleApplied': {
                                                cache.upsert(event.payload);
                                                break;
                                            }
                                            case 'TransferRuleDeleted': {
                                                cache.remove(event.payload.id);
                                                break;
                                            }
                                        }
                                    }
                                }

                                return createSyncedValueDescriptor(cache);
                            },
                        ),
                        mapValueDescriptor(({ value }) =>
                            createSyncedValueDescriptor(value.getItems()),
                        ),
                    ),
                ),
            );
        };
    },
    {
        dedobs: {
            normalize: constantNormalizer,
            resetDelay: SHARE_RESET_DELAY,
            removeDelay: DEDUPE_REMOVE_DELAY,
        },
    },
);
