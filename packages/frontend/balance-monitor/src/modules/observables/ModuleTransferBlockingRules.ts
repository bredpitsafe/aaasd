import { DEDUPE_REMOVE_DELAY, SHARE_RESET_DELAY } from '@frontend/common/src/defs/observables';
import type { TContextRef } from '@frontend/common/src/di';
import { ModuleFactory } from '@frontend/common/src/di';
import { ModuleSubscribeToTransferRulesHandler } from '@frontend/common/src/modules/handlers/balanceMonitor/ModuleSubscribeToTransferRulesHandler';
import { ModuleSocketPage } from '@frontend/common/src/modules/socketPage';
import type { TTransferBlockingRuleInfo } from '@frontend/common/src/types/domain/balanceMonitor/defs';
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

const createFail = FailFactory('TransferBlockingRulesSubscription');
const descFactory = ValueDescriptorFactory<
    TTransferBlockingRuleInfo[],
    TFail<'[TransferBlockingRulesSubscription]: UNKNOWN'>
>();

export type TTransfersBlockingRulesDescriptor = ExtractValueDescriptor<typeof descFactory>;

export const ModuleTransferBlockingRules = ModuleFactory((ctx: TContextRef) => {
    let subscribeTraceId: TraceId | undefined = undefined;

    const getTransferBlockingRules$ = dedobs(
        (traceId: TraceId): Observable<TTransfersBlockingRulesDescriptor> => {
            const subscribeToTransferRulesHandler = ModuleSubscribeToTransferRulesHandler(ctx);
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
                            payloads.forEach((payload) => {
                                const { type } = payload;

                                switch (type) {
                                    case 'Subscribed':
                                        acc.clear();
                                        return;
                                    case 'TransferRuleApplied':
                                        acc.upsert(payload);
                                        return;
                                    case 'TransferRuleDeleted':
                                        acc.remove(payload.id);
                                        return;
                                    default:
                                        assertNever(type);
                                }
                            });

                            return acc;
                        }, new UpdatableUnifierWithCompositeHash<TTransferBlockingRuleInfo, 'id'>('id')),
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
                        `ModuleGetTransferBlockingRules: traceId ${traceId} reuse observable with traceId ${subscribeTraceId}`,
                    );
                }

                return 0;
            },
            removeDelay: DEDUPE_REMOVE_DELAY,
        },
    );

    return { getTransferBlockingRules$ };
});
