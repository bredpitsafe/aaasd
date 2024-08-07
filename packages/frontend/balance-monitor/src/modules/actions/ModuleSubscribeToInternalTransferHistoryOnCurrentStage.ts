import { isSubscriptionEventSubscribed } from '@common/rx';
import { DEDUPE_REMOVE_DELAY, SHARE_RESET_DELAY } from '@frontend/common/src/defs/observables.ts';
import type { TContextRef } from '@frontend/common/src/di';
import { ModuleSocketPage } from '@frontend/common/src/modules/socketPage';
import type { TInternalTransfer } from '@frontend/common/src/types/domain/balanceMonitor/defs.ts';
import type { TSocketURL } from '@frontend/common/src/types/domain/sockets.ts';
import { createObservableProcedure } from '@frontend/common/src/utils/LPC/createObservableProcedure.ts';
import { constantNormalizer } from '@frontend/common/src/utils/observable/memo.ts';
import { bufferTimeValueDescriptor } from '@frontend/common/src/utils/Rx/bufferTimeValueDescriptor.ts';
import {
    mapValueDescriptor,
    scanValueDescriptor,
} from '@frontend/common/src/utils/Rx/ValueDescriptor2.ts';
import { UnifierWithCompositeHash } from '@frontend/common/src/utils/unifierWithCompositeHash.ts';
import type { TValueDescriptor2 } from '@frontend/common/src/utils/ValueDescriptor/types.ts';
import { createSyncedValueDescriptor } from '@frontend/common/src/utils/ValueDescriptor/utils.ts';
import type { Observable } from 'rxjs';
import { filter, switchMap } from 'rxjs/operators';

import { BUFFER_INTERVAL } from './defs.ts';
import { ModuleSubscribeToInternalTransferHistory } from './ModuleSubscribeToInternalTransferHistory.ts';

export type TInternalTransferHistoryDescriptor = TValueDescriptor2<TInternalTransfer[]>;

export const ModuleSubscribeToInternalTransferHistoryOnCurrentStage = createObservableProcedure(
    (ctx: TContextRef) => {
        const subscribeToInternalTransferHistory = ModuleSubscribeToInternalTransferHistory(ctx);
        const { currentSocketUrl$ } = ModuleSocketPage(ctx);

        return (_, options): Observable<TInternalTransferHistoryDescriptor> => {
            return currentSocketUrl$.pipe(
                filter((url): url is TSocketURL => url !== undefined),
                switchMap((target) =>
                    subscribeToInternalTransferHistory(
                        { target },
                        { ...options, skipAuthentication: false, enableLogs: false },
                    ).pipe(
                        bufferTimeValueDescriptor(BUFFER_INTERVAL),
                        scanValueDescriptor(
                            (
                                acc:
                                    | undefined
                                    | TValueDescriptor2<
                                          UnifierWithCompositeHash<TInternalTransfer>
                                      >,
                                { value: events },
                            ) => {
                                const cache =
                                    acc?.value ??
                                    new UnifierWithCompositeHash<TInternalTransfer>('clientId');

                                for (const event of events) {
                                    if (isSubscriptionEventSubscribed(event)) {
                                        cache.clear();
                                    } else {
                                        cache.modify([event.payload]);
                                    }
                                }

                                return createSyncedValueDescriptor(cache);
                            },
                        ),
                        mapValueDescriptor(({ value }) =>
                            createSyncedValueDescriptor(value.toArray()),
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
