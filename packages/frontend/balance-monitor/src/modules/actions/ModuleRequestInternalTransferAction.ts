import type { TContextRef } from '@frontend/common/src/di';
import { ModuleFactory } from '@frontend/common/src/di';
import { ModuleMessages } from '@frontend/common/src/lib/messages';
import { ModuleRequestInternalTransferHandle } from '@frontend/common/src/modules/handlers/balanceMonitor/ModuleRequestInternalTransferHandle';
import { ModuleNotifications } from '@frontend/common/src/modules/notifications/module';
import { ModuleSocketPage } from '@frontend/common/src/modules/socketPage';
import type { TInternalTransferAction } from '@frontend/common/src/types/domain/balanceMonitor/defs';
import type { TSocketURL } from '@frontend/common/src/types/domain/sockets';
import { FailFactory, TFail } from '@frontend/common/src/types/Fail';
import type { TraceId } from '@frontend/common/src/utils/traceId';
import {
    ExtractValueDescriptor,
    ValueDescriptorFactory,
} from '@frontend/common/src/utils/ValueDescriptor';
import { catchError, Observable, of, startWith } from 'rxjs';
import { finalize, first, map, switchMap } from 'rxjs/operators';

import { getNotificationError } from '../utils';

const createFail = FailFactory('RequestInternalTransfer');
const descFactory = ValueDescriptorFactory<true, TFail<'[RequestInternalTransfer]: UNKNOWN'>>();

type TRequestInternalTransferDescriptor = ExtractValueDescriptor<typeof descFactory>;

export const ModuleRequestInternalTransferAction = ModuleFactory((ctx: TContextRef) => {
    const { currentSocketUrl$ } = ModuleSocketPage(ctx);
    const requestInternalTransferHandle = ModuleRequestInternalTransferHandle(ctx);
    const { loading, success } = ModuleMessages(ctx);
    const notify = ModuleNotifications(ctx);

    return {
        requestInternalTransfer(
            props: TInternalTransferAction,
            traceId: TraceId,
        ): Observable<TRequestInternalTransferDescriptor> {
            const closeLoading = loading('Request internal transfer...');

            return currentSocketUrl$.pipe(
                first((url): url is TSocketURL => url !== undefined),
                switchMap((url) =>
                    requestInternalTransferHandle(url, props, { traceId }).pipe(
                        map((): TRequestInternalTransferDescriptor => {
                            void success('Internal transfer requested successfully');
                            return descFactory.sync(true, null);
                        }),
                        catchError((err) => {
                            notify.error({
                                ...getNotificationError('Failed to request internal transfer', err),
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
