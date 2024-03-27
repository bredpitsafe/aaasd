import type { TContextRef } from '@frontend/common/src/di';
import { ModuleFactory } from '@frontend/common/src/di';
import { ModuleMessages } from '@frontend/common/src/lib/messages';
import { ModuleDeleteTransferRuleHandle } from '@frontend/common/src/modules/handlers/balanceMonitor/ModuleDeleteTransferRuleHandle';
import { ModuleNotifications } from '@frontend/common/src/modules/notifications/module';
import { ModuleSocketPage } from '@frontend/common/src/modules/socketPage';
import type { TRuleId } from '@frontend/common/src/types/domain/balanceMonitor/defs';
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

const createFail = FailFactory('DeleteTransferBlockingRuleUpdate');
const descFactory = ValueDescriptorFactory<
    true,
    TFail<'[DeleteTransferBlockingRuleUpdate]: UNKNOWN'>
>();

type TDeleteTransferBlockingRuleDescriptor = ExtractValueDescriptor<typeof descFactory>;

export const ModuleDeleteTransferBlockingRuleAction = ModuleFactory((ctx: TContextRef) => {
    const { currentSocketUrl$ } = ModuleSocketPage(ctx);
    const deleteTransferRuleHandle = ModuleDeleteTransferRuleHandle(ctx);
    const { loading, success } = ModuleMessages(ctx);
    const notify = ModuleNotifications(ctx);

    return {
        deleteTransferBlockingRule(
            id: TRuleId,
            traceId: TraceId,
        ): Observable<TDeleteTransferBlockingRuleDescriptor> {
            const closeLoading = loading('Deleting transfer blocking rule...');

            return currentSocketUrl$.pipe(
                first((url): url is TSocketURL => url !== undefined),
                switchMap((url) =>
                    deleteTransferRuleHandle(url, { id }, { traceId }).pipe(
                        map((): TDeleteTransferBlockingRuleDescriptor => {
                            void success('Transfer blocking rule removed successfully');
                            return descFactory.sync(true, null);
                        }),
                        catchError((err) => {
                            notify.error({
                                ...getNotificationError(
                                    'Failed to delete transfer blocking rule',
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
