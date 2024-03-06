import type { TContextRef } from '@frontend/common/src/di';
import { ModuleFactory } from '@frontend/common/src/di';
import { ModuleRequestCoinTransferDetailsHandle } from '@frontend/common/src/modules/handlers/balanceMonitor/ModuleRequestCoinTransferDetailsHandle';
import { ModuleNotifications } from '@frontend/common/src/modules/notifications/module';
import { ModuleSocketPage } from '@frontend/common/src/modules/socketPage';
import type {
    TCoinId,
    TCoinTransferDetailsItem,
} from '@frontend/common/src/types/domain/balanceMonitor/defs';
import type { TSocketURL } from '@frontend/common/src/types/domain/sockets';
import { FailFactory, TFail } from '@frontend/common/src/types/Fail';
import { dedobs } from '@frontend/common/src/utils/observable/memo';
import { createObservableBox } from '@frontend/common/src/utils/rx';
import { retryWithPassFailDescriptor } from '@frontend/common/src/utils/Rx/retryWithPassFailDescriptor';
import { shareReplayWithImmediateReset } from '@frontend/common/src/utils/Rx/share';
import { tapError } from '@frontend/common/src/utils/Rx/tap';
import { shallowHash } from '@frontend/common/src/utils/shallowHash';
import type { TraceId } from '@frontend/common/src/utils/traceId';
import { logger } from '@frontend/common/src/utils/Tracing';
import {
    ExtractValueDescriptor,
    ValueDescriptorFactory,
} from '@frontend/common/src/utils/ValueDescriptor';
import type { Observable } from 'rxjs';
import { distinctUntilChanged, filter, map, mapTo, startWith, switchMap } from 'rxjs/operators';

import { getNotificationError } from '../utils';
import { RESTART_FAILED_SUBSCRIPTION_TIMEOUT } from './defs';

const createFail = FailFactory('CoinTransferDetails');
const descFactory = ValueDescriptorFactory<
    TCoinTransferDetailsItem[],
    TFail<'[CoinTransferDetails]: UNKNOWN'>
>();

export type TCoinTransferDetailsDescriptor = ExtractValueDescriptor<typeof descFactory>;

export const ModuleCoinTransferDetails = ModuleFactory((ctx: TContextRef) => {
    const refreshCoinTransferDetailsBox = createObservableBox<TCoinId | undefined>(undefined);

    let subscribeTraceId: TraceId | undefined = undefined;

    const getCoinTransferDetails$ = dedobs(
        (coin: TCoinId, traceId: TraceId): Observable<TCoinTransferDetailsDescriptor> => {
            const requestCoinTransferDetailsHandle = ModuleRequestCoinTransferDetailsHandle(ctx);
            const { currentSocketUrl$ } = ModuleSocketPage(ctx);
            const notify = ModuleNotifications(ctx);

            subscribeTraceId = traceId;

            return currentSocketUrl$.pipe(
                filter((url): url is TSocketURL => url !== undefined),
                distinctUntilChanged(),
                switchMap((url) =>
                    refreshCoinTransferDetailsBox.obs.pipe(
                        startWith(coin),
                        filter((refreshCoin): refreshCoin is TCoinId => refreshCoin === coin),
                        mapTo(url),
                    ),
                ),
                switchMap((url) =>
                    requestCoinTransferDetailsHandle(url, { coin }, { traceId }).pipe(
                        map(({ details }) => details),
                        map((details) => descFactory.sync(details, null)),
                        startWith(descFactory.unsc(null)),
                    ),
                ),
                tapError((err) => {
                    notify.error({
                        ...getNotificationError('Failed to fetch coin transfer details', err),
                        traceId,
                    });
                }),
                retryWithPassFailDescriptor(
                    createFail('UNKNOWN'),
                    RESTART_FAILED_SUBSCRIPTION_TIMEOUT,
                ),
                shareReplayWithImmediateReset(),
            );
        },
        {
            normalize: ([coin, traceId]) => {
                // Temporary solution to connect traceId
                if (subscribeTraceId !== undefined && subscribeTraceId !== traceId) {
                    logger.info(
                        `ModuleGetCoinTransferDetails: traceId ${traceId} reuse observable with traceId ${subscribeTraceId}`,
                    );
                }

                return shallowHash(coin);
            },
        },
    );

    return {
        refreshCoinTransferDetails(coin: TCoinId): void {
            refreshCoinTransferDetailsBox.set(coin);
        },
        getCoinTransferDetails$,
    };
});
