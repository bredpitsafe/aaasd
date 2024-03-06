import { DEDUPE_REMOVE_DELAY, SHARE_RESET_DELAY } from '@frontend/common/src/defs/observables';
import type { TContextRef } from '@frontend/common/src/di';
import { ModuleFactory } from '@frontend/common/src/di';
import { ModuleSubscribeToAutoTransferRulesHandler } from '@frontend/common/src/modules/handlers/balanceMonitor/ModuleSubscribeToAutoTransferRulesHandler';
import { ModuleSocketPage } from '@frontend/common/src/modules/socketPage';
import type { TAutoTransferRuleInfo } from '@frontend/common/src/types/domain/balanceMonitor/defs';
import type { TSocketURL } from '@frontend/common/src/types/domain/sockets';
import { FailFactory, TFail } from '@frontend/common/src/types/Fail';
import { assertNever } from '@frontend/common/src/utils/assert';
import { dedobs } from '@frontend/common/src/utils/observable/memo';
import { retryWithPassFailDescriptor } from '@frontend/common/src/utils/Rx/retryWithPassFailDescriptor';
import { shareReplayWithDelayedReset } from '@frontend/common/src/utils/Rx/share';
import type { TraceId } from '@frontend/common/src/utils/traceId';
import { logger } from '@frontend/common/src/utils/Tracing';
import { UpdatableUnifierWithCompositeHash } from '@frontend/common/src/utils/UpdatableUnifierWithCompositeHash';
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

const createFail = FailFactory('AutoTransferRulesSubscription');
const descFactory = ValueDescriptorFactory<
    TAutoTransferRuleInfo[],
    TFail<'[AutoTransferRulesSubscription]: UNKNOWN'>
>();

export type TAutoTransferRulesDescriptor = ExtractValueDescriptor<typeof descFactory>;

export const ModuleAutoTransferRules = ModuleFactory((ctx: TContextRef) => {
    let subscribeTraceId: TraceId | undefined = undefined;

    const getAutoTransferRules$ = dedobs(
        (traceId: TraceId): Observable<TAutoTransferRulesDescriptor> => {
            const subscribeToTransferRulesHandler = ModuleSubscribeToAutoTransferRulesHandler(ctx);
            const { currentSocketUrl$ } = ModuleSocketPage(ctx);

            subscribeTraceId = traceId;

            return currentSocketUrl$.pipe(
                filter((url): url is TSocketURL => url !== undefined),
                distinctUntilChanged(),
                switchMap((url) =>
                    subscribeToTransferRulesHandler(url, {}, { traceId }).pipe(
                        bufferTime(BUFFER_INTERVAL),
                        filter(({ length }) => length > 0),
                        scan((acc, payloads) => {
                            payloads.forEach(({ payload }) => {
                                const { type } = payload;

                                switch (type) {
                                    case 'Subscribed':
                                        acc.clear();
                                        return;
                                    case 'AutoTransferRuleApplied':
                                        acc.upsert(payload);
                                        return;
                                    case 'AutoTransferRuleDeleted':
                                        acc.remove(payload.id);
                                        return;
                                    default:
                                        assertNever(type);
                                }
                            });

                            return acc;
                        }, new UpdatableUnifierWithCompositeHash<TAutoTransferRuleInfo, 'id'>('id')),
                        map((cache) => descFactory.sync(cache.getItems(), null)),
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
                        `ModuleGetAutoTransferRules: traceId ${traceId} reuse observable with traceId ${subscribeTraceId}`,
                    );
                }

                return 0;
            },
            removeDelay: DEDUPE_REMOVE_DELAY,
        },
    );

    return { getAutoTransferRules$ };
});
