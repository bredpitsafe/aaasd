import { isSubscriptionEventSubscribed } from '@common/rx';
import { DEDUPE_REMOVE_DELAY, SHARE_RESET_DELAY } from '@frontend/common/src/defs/observables.ts';
import type { TContextRef } from '@frontend/common/src/di';
import { ModuleSocketPage } from '@frontend/common/src/modules/socketPage';
import type {
    TCoinConvertRate,
    TCoinId,
} from '@frontend/common/src/types/domain/balanceMonitor/defs.ts';
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

import { BUFFER_INTERVAL } from './defs';
import { ModuleSubscribeToConvertRates } from './ModuleSubscribeToConvertRates.ts';

export type TConvertRatesDescriptor = TValueDescriptor2<ReadonlyMap<TCoinId, TCoinConvertRate>>;

export const ModuleSubscribeToConvertRatesOnCurrentStage = createObservableProcedure(
    (ctx: TContextRef) => {
        const subscribeToConvertRates = ModuleSubscribeToConvertRates(ctx);
        const { currentSocketUrl$ } = ModuleSocketPage(ctx);

        return (_, options): Observable<TConvertRatesDescriptor> => {
            return currentSocketUrl$.pipe(
                filter((url): url is TSocketURL => url !== undefined),
                switchMap((target) =>
                    subscribeToConvertRates(
                        { target },
                        { ...options, skipAuthentication: false },
                    ).pipe(
                        bufferTimeValueDescriptor(BUFFER_INTERVAL),
                        scanValueDescriptor(
                            (
                                acc:
                                    | undefined
                                    | TValueDescriptor2<UnifierWithCompositeHash<TCoinConvertRate>>,
                                { value: events },
                            ) => {
                                const cache =
                                    acc?.value ??
                                    new UnifierWithCompositeHash<TCoinConvertRate>('base');

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
                            createSyncedValueDescriptor(
                                new Map(
                                    value.getMap() as unknown as ReadonlyMap<
                                        TCoinId,
                                        TCoinConvertRate
                                    >,
                                ),
                            ),
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
