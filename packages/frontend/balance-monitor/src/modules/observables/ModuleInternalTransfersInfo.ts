import { DEDUPE_REMOVE_DELAY, SHARE_RESET_DELAY } from '@frontend/common/src/defs/observables';
import type { TContextRef } from '@frontend/common/src/di';
import { ModuleFactory } from '@frontend/common/src/di';
import { ModuleSubscribeToInternalTransfersCapabilitiesHandle } from '@frontend/common/src/modules/handlers/balanceMonitor/ModuleSubscribeToInternalTransfersCapabilitiesHandle';
import { ModuleSocketPage } from '@frontend/common/src/modules/socketPage';
import type { TPossibleInternalTransfer } from '@frontend/common/src/types/domain/balanceMonitor/defs';
import type { TSocketURL } from '@frontend/common/src/types/domain/sockets';
import { FailFactory, TFail } from '@frontend/common/src/types/Fail';
import { dedobs } from '@frontend/common/src/utils/observable/memo';
import { retryWithPassFailDescriptor } from '@frontend/common/src/utils/Rx/retryWithPassFailDescriptor';
import { shareReplayWithDelayedReset } from '@frontend/common/src/utils/Rx/share';
import type { TraceId } from '@frontend/common/src/utils/traceId';
import { logger } from '@frontend/common/src/utils/Tracing';
import {
    ExtractValueDescriptor,
    ValueDescriptorFactory,
} from '@frontend/common/src/utils/ValueDescriptor';
import type { Observable } from 'rxjs';
import { distinctUntilChanged, filter, map, startWith, switchMap } from 'rxjs/operators';

import { RESTART_FAILED_SUBSCRIPTION_TIMEOUT } from './defs';

const createFail = FailFactory('InternalTransfersInfo');
const descFactory = ValueDescriptorFactory<
    TPossibleInternalTransfer[],
    TFail<'[InternalTransfersInfo]: UNKNOWN'>
>();

type TInternalTransfersInfoDescriptor = ExtractValueDescriptor<typeof descFactory>;

export const ModuleInternalTransfersInfo = ModuleFactory((ctx: TContextRef) => {
    let subscribeTraceId: TraceId | undefined = undefined;

    const getInternalTransfersInfo$ = dedobs(
        (traceId: TraceId): Observable<TInternalTransfersInfoDescriptor> => {
            const subscribeToInternalTransfersCapabilitiesHandle =
                ModuleSubscribeToInternalTransfersCapabilitiesHandle(ctx);
            const { currentSocketUrl$ } = ModuleSocketPage(ctx);

            subscribeTraceId = traceId;

            return currentSocketUrl$.pipe(
                filter((url): url is TSocketURL => url !== undefined),
                distinctUntilChanged(),
                switchMap((url) =>
                    subscribeToInternalTransfersCapabilitiesHandle(url, {}, { traceId }).pipe(
                        map((payload) =>
                            descFactory.sync(
                                payload.type === 'Subscribed' ? [] : payload.possibleTransfers,
                                null,
                            ),
                        ),
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
                        `ModuleGetInternalTransfersInfo: traceId ${traceId} reuse observable with traceId ${subscribeTraceId}`,
                    );
                }

                return 0;
            },
            removeDelay: DEDUPE_REMOVE_DELAY,
        },
    );

    return { getInternalTransfersInfo$ };
});
