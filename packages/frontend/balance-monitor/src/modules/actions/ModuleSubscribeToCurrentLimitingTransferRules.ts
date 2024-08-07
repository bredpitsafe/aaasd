import { isSubscriptionEventSubscribed } from '@common/rx';
import { DEDUPE_REMOVE_DELAY, SHARE_RESET_DELAY } from '@frontend/common/src/defs/observables.ts';
import type { TContextRef } from '@frontend/common/src/di';
import { ModuleSocketPage } from '@frontend/common/src/modules/socketPage';
import type { TAmountLimitsRuleInfo } from '@frontend/common/src/types/domain/balanceMonitor/defs.ts';
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
import { ModuleSubscribeToLimitingTransferRules } from './ModuleSubscribeToLimitingTransferRules.ts';

export type TAmountLimitsRulesDescriptor = TValueDescriptor2<TAmountLimitsRuleInfo[]>;

export const ModuleSubscribeToCurrentLimitingTransferRules = createObservableProcedure(
    (ctx: TContextRef) => {
        const subscribeToToLimitingTransferRules = ModuleSubscribeToLimitingTransferRules(ctx);
        const { currentSocketUrl$ } = ModuleSocketPage(ctx);

        return (_, options): Observable<TAmountLimitsRulesDescriptor> => {
            return currentSocketUrl$.pipe(
                filter((url): url is TSocketURL => url !== undefined),
                switchMap((target) =>
                    subscribeToToLimitingTransferRules(
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
                                              TAmountLimitsRuleInfo,
                                              'id'
                                          >
                                      >,
                                { value: events },
                            ) => {
                                const cache =
                                    acc?.value ??
                                    new UpdatableUnifierWithCompositeHash<
                                        TAmountLimitsRuleInfo,
                                        'id'
                                    >('id');

                                for (const event of events) {
                                    if (isSubscriptionEventSubscribed(event)) {
                                        cache.clear();
                                    } else {
                                        const { type } = event.payload;

                                        switch (type) {
                                            case 'LimitingTransferRuleApplied': {
                                                cache.upsert(event.payload);
                                                break;
                                            }
                                            case 'LimitingTransferRuleDeleted': {
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
