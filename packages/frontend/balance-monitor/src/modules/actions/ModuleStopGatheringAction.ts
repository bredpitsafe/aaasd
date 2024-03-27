import type { TContextRef } from '@frontend/common/src/di';
import { ModuleFactory } from '@frontend/common/src/di';
import { ModuleMessages } from '@frontend/common/src/lib/messages';
import { ModuleStopGatheringHandle } from '@frontend/common/src/modules/handlers/balanceMonitor/ModuleStopGatheringHandle';
import { ModuleNotifications } from '@frontend/common/src/modules/notifications/module';
import { ModuleSocketPage } from '@frontend/common/src/modules/socketPage';
import type { TCoinId, TExchangeId } from '@frontend/common/src/types/domain/balanceMonitor/defs';
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

const createFail = FailFactory('StopGathering');
const descFactory = ValueDescriptorFactory<true, TFail<'[StopGathering]: UNKNOWN'>>();

type TStopGatheringDescriptor = ExtractValueDescriptor<typeof descFactory>;

export const ModuleStopGatheringAction = ModuleFactory((ctx: TContextRef) => {
    const { currentSocketUrl$ } = ModuleSocketPage(ctx);
    const stopGatheringHandle = ModuleStopGatheringHandle(ctx);
    const { loading, success } = ModuleMessages(ctx);
    const notify = ModuleNotifications(ctx);

    return {
        stopGathering(
            exchange: TExchangeId,
            coin: TCoinId,
            traceId: TraceId,
        ): Observable<TStopGatheringDescriptor> {
            const closeLoading = loading('Stopping Gathering...');

            return currentSocketUrl$.pipe(
                first((url): url is TSocketURL => url !== undefined),
                switchMap((url) =>
                    stopGatheringHandle(url, { exchange, coin }, { traceId }).pipe(
                        map((): TStopGatheringDescriptor => {
                            void success('Gathering stopped successfully');
                            return descFactory.sync(true, null);
                        }),
                        catchError((err) => {
                            notify.error({
                                ...getNotificationError(
                                    `Failed to stop gathering for coin ${coin}`,
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
