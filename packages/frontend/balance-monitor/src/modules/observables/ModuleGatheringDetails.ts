import { SHARE_RESET_DELAY } from '@frontend/common/src/defs/observables';
import type { TContextRef } from '@frontend/common/src/di';
import { ModuleFactory } from '@frontend/common/src/di';
import { ModuleRequestGatheringDetailsHandle } from '@frontend/common/src/modules/handlers/balanceMonitor/ModuleRequestGatheringDetailsHandle';
import { ModuleNotifications } from '@frontend/common/src/modules/notifications/module';
import { ModuleSocketPage } from '@frontend/common/src/modules/socketPage';
import type { TExchangeId } from '@frontend/common/src/types/domain/balanceMonitor/defs';
import type { TSocketURL } from '@frontend/common/src/types/domain/sockets';
import { FailFactory, TFail } from '@frontend/common/src/types/Fail';
import { dedobs } from '@frontend/common/src/utils/observable/memo';
import { retryWithPassFailDescriptor } from '@frontend/common/src/utils/Rx/retryWithPassFailDescriptor';
import { shareReplayWithDelayedReset } from '@frontend/common/src/utils/Rx/share';
import { tapError } from '@frontend/common/src/utils/Rx/tap';
import type { TraceId } from '@frontend/common/src/utils/traceId';
import { logger } from '@frontend/common/src/utils/Tracing';
import {
    ExtractValueDescriptor,
    ValueDescriptorFactory,
} from '@frontend/common/src/utils/ValueDescriptor';
import type { Observable } from 'rxjs';
import { filter, map, startWith, switchMap } from 'rxjs/operators';

import { getNotificationError } from '../utils';
import { RESTART_FAILED_SUBSCRIPTION_TIMEOUT } from './defs';

const createFail = FailFactory('FetchGatheringDetails');
const descFactory = ValueDescriptorFactory<
    TExchangeId[],
    TFail<'[FetchGatheringDetails]: UNKNOWN'>
>();

type TGatheringDetailsDescriptor = ExtractValueDescriptor<typeof descFactory>;

export const ModuleGatheringDetails = ModuleFactory((ctx: TContextRef) => {
    let subscribeTraceId: TraceId | undefined = undefined;

    const getGatheringDetails$ = dedobs(
        (traceId: TraceId): Observable<TGatheringDetailsDescriptor> => {
            const requestGatheringDetailsHandle = ModuleRequestGatheringDetailsHandle(ctx);
            const { currentSocketUrl$ } = ModuleSocketPage(ctx);
            const notify = ModuleNotifications(ctx);

            subscribeTraceId = traceId;

            return currentSocketUrl$.pipe(
                filter((url): url is TSocketURL => url !== undefined),
                switchMap((url) =>
                    requestGatheringDetailsHandle(url, {}, { traceId }).pipe(
                        map(({ exchanges }) => descFactory.sync(exchanges, null)),
                        startWith(descFactory.unsc(null)),
                    ),
                ),
                tapError((err) => {
                    notify.error({
                        ...getNotificationError('Failed to fetch gathering details', err),
                        traceId,
                    });
                }),
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
                        `ModuleGetGatheringDetails: traceId ${traceId} reuse observable with traceId ${subscribeTraceId}`,
                    );
                }

                return 0;
            },
        },
    );

    return { getGatheringDetails$ };
});
