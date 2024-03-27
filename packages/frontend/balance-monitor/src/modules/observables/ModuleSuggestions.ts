import { DEDUPE_REMOVE_DELAY, SHARE_RESET_DELAY } from '@frontend/common/src/defs/observables';
import type { TContextRef } from '@frontend/common/src/di';
import { ModuleFactory } from '@frontend/common/src/di';
import { ModuleSubscribeToSuggestsHandle } from '@frontend/common/src/modules/handlers/balanceMonitor/ModuleSubscribeToSuggestsHandle';
import { ModuleSocketPage } from '@frontend/common/src/modules/socketPage';
import type { TCoinBalanceReconciliationSuggest } from '@frontend/common/src/types/domain/balanceMonitor/defs';
import type { TSocketURL } from '@frontend/common/src/types/domain/sockets';
import { FailFactory, TFail } from '@frontend/common/src/types/Fail';
import { dedobs } from '@frontend/common/src/utils/observable/memo';
import { retryWithPassFailDescriptor } from '@frontend/common/src/utils/Rx/retryWithPassFailDescriptor';
import { shareReplayWithDelayedReset } from '@frontend/common/src/utils/Rx/share';
import type { TraceId } from '@frontend/common/src/utils/traceId';
import { logger } from '@frontend/common/src/utils/Tracing';
import { UnifierWithCompositeHash } from '@frontend/common/src/utils/unifierWithCompositeHash';
import {
    ExtractValueDescriptor,
    ValueDescriptorFactory,
} from '@frontend/common/src/utils/ValueDescriptor';
import type { Observable } from 'rxjs';
import {
    bufferTime,
    distinctUntilChanged,
    filter,
    map,
    scan,
    startWith,
    switchMap,
} from 'rxjs/operators';

import { BUFFER_INTERVAL, RESTART_FAILED_SUBSCRIPTION_TIMEOUT } from './defs';

const createFail = FailFactory('TransferSuggestions');
const descFactory = ValueDescriptorFactory<
    TCoinBalanceReconciliationSuggest[],
    TFail<'[TransferSuggestions]: UNKNOWN'>
>();

export type TSuggestionsDescriptor = ExtractValueDescriptor<typeof descFactory>;

export const ModuleSuggestions = ModuleFactory((ctx: TContextRef) => {
    let subscribeTraceId: TraceId | undefined = undefined;

    const getSuggestions$ = dedobs(
        (traceId: TraceId): Observable<TSuggestionsDescriptor> => {
            const subscribeToSuggestsHandle = ModuleSubscribeToSuggestsHandle(ctx);
            const { currentSocketUrl$ } = ModuleSocketPage(ctx);

            subscribeTraceId = traceId;

            return currentSocketUrl$.pipe(
                filter((url): url is TSocketURL => url !== undefined),
                distinctUntilChanged(),
                switchMap((url) =>
                    subscribeToSuggestsHandle(url, {}, { traceId }).pipe(
                        bufferTime(BUFFER_INTERVAL),
                        filter(({ length }) => length > 0),
                        scan((acc, payloads) => {
                            payloads.forEach((payload) => {
                                if (payload.type === 'Subscribed') {
                                    acc.clear();
                                    return acc;
                                }

                                acc.modify([payload]);
                            });

                            return acc;
                        }, new UnifierWithCompositeHash<TCoinBalanceReconciliationSuggest>('coin')),
                        map((cache) => descFactory.sync(cache.toArray(), null)),
                        startWith(descFactory.unsc(null)),
                    ),
                ),
                retryWithPassFailDescriptor(
                    createFail('UNKNOWN'),
                    RESTART_FAILED_SUBSCRIPTION_TIMEOUT,
                ),
                shareReplayWithDelayedReset(SHARE_RESET_DELAY),
            );
        },
        {
            normalize: ([traceId]) => {
                // Temporary solution to connect traceId
                if (subscribeTraceId !== undefined && subscribeTraceId !== traceId) {
                    logger.info(
                        `ModuleGetSuggestions: traceId ${traceId} reuse observable with traceId ${subscribeTraceId}`,
                    );
                }

                return 0;
            },
            removeDelay: DEDUPE_REMOVE_DELAY,
        },
    );

    return { getSuggestions$ };
});
