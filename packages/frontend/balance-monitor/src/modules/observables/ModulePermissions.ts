import { DEDUPE_REMOVE_DELAY, SHARE_RESET_DELAY } from '@frontend/common/src/defs/observables';
import { ModuleFactory, TContextRef } from '@frontend/common/src/di';
import { ModuleSubscribeToPermissionsHandle } from '@frontend/common/src/modules/handlers/balanceMonitor/ModuleSubscribeToPermissionsHandle';
import { ModuleSocketPage } from '@frontend/common/src/modules/socketPage';
import type { EBalanceMonitorLayoutPermissions } from '@frontend/common/src/types/domain/balanceMonitor/defs';
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

const createFail = FailFactory('SubscribeToPermissions');
const descFactory = ValueDescriptorFactory<
    EBalanceMonitorLayoutPermissions[],
    TFail<'[SubscribeToPermissions]: UNKNOWN'>
>();

type TPermissionsDescriptor = ExtractValueDescriptor<typeof descFactory>;

export const ModulePermissions = ModuleFactory((ctx: TContextRef) => {
    let subscribeTraceId: TraceId | undefined = undefined;

    const getPermissions$ = dedobs(
        (traceId: TraceId): Observable<TPermissionsDescriptor> => {
            const subscribeToPermissionsHandle = ModuleSubscribeToPermissionsHandle(ctx);
            const { currentSocketUrl$ } = ModuleSocketPage(ctx);

            subscribeTraceId = traceId;

            return currentSocketUrl$.pipe(
                filter((url): url is TSocketURL => url !== undefined),
                distinctUntilChanged(),
                switchMap((url) =>
                    subscribeToPermissionsHandle(url, {}, { traceId }).pipe(
                        map((payload) =>
                            payload.type === 'Subscribed'
                                ? descFactory.unsc(null)
                                : descFactory.sync(payload.availableTabs, null),
                        ),
                    ),
                ),
                startWith(descFactory.unsc(null)),
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
                        `ModuleGetPermissions: traceId ${traceId} reuse observable with traceId ${subscribeTraceId}`,
                    );
                }

                return 0;
            },
            removeDelay: DEDUPE_REMOVE_DELAY,
        },
    );

    return { getPermissions$ };
});
