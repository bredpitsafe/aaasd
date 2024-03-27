import type { TContextRef } from '@frontend/common/src/di';
import { ModuleFactory } from '@frontend/common/src/di';
import { ModuleMessages } from '@frontend/common/src/lib/messages';
import { ModuleStartGatheringHandle } from '@frontend/common/src/modules/handlers/balanceMonitor/ModuleStartGatheringHandle';
import { ModuleNotifications } from '@frontend/common/src/modules/notifications/module';
import { ModuleSocketPage } from '@frontend/common/src/modules/socketPage';
import type {
    TAmount,
    TCoinId,
    TExchangeId,
} from '@frontend/common/src/types/domain/balanceMonitor/defs';
import type { TSocketURL } from '@frontend/common/src/types/domain/sockets';
import { FailFactory, TFail } from '@frontend/common/src/types/Fail';
import type { TraceId } from '@frontend/common/src/utils/traceId';
import {
    ExtractValueDescriptor,
    ValueDescriptorFactory,
} from '@frontend/common/src/utils/ValueDescriptor';
import { Observable, of } from 'rxjs';
import { catchError, finalize, first, map, startWith, switchMap } from 'rxjs/operators';

import { getNotificationError } from '../utils';

const createFail = FailFactory('StartGathering');
const descFactory = ValueDescriptorFactory<true, TFail<'[StartGathering]: UNKNOWN'>>();

type TStartGatheringDescriptor = ExtractValueDescriptor<typeof descFactory>;

export const ModuleStartGatheringAction = ModuleFactory((ctx: TContextRef) => {
    const { currentSocketUrl$ } = ModuleSocketPage(ctx);
    const startGatheringHandle = ModuleStartGatheringHandle(ctx);
    const { loading, success } = ModuleMessages(ctx);
    const notify = ModuleNotifications(ctx);

    return {
        startGathering(
            exchange: TExchangeId,
            coin: TCoinId,
            amount: TAmount,
            traceId: TraceId,
        ): Observable<TStartGatheringDescriptor> {
            const closeLoading = loading('Starting Gathering...');

            return currentSocketUrl$.pipe(
                first((url): url is TSocketURL => url !== undefined),
                switchMap((url) =>
                    startGatheringHandle(url, { exchange, coin, amount }, { traceId }).pipe(
                        map((): TStartGatheringDescriptor => {
                            void success('Gathering started successfully');
                            return descFactory.sync(true, null);
                        }),
                        catchError((err) => {
                            notify.error({
                                ...getNotificationError(
                                    `Failed to start gathering for coin ${coin}`,
                                    err,
                                ),
                                traceId,
                            });
                            return of(descFactory.fail(createFail('UNKNOWN')));
                        }),
                        startWith(descFactory.unsc(null)),
                    ),
                ),
                finalize(closeLoading),
            );
        },
    };
});
