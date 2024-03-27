import type { TContextRef } from '@frontend/common/src/di';
import { ModuleFactory } from '@frontend/common/src/di';
import { ModuleMessages } from '@frontend/common/src/lib/messages';
import { ModuleDeleteAutoTransferRuleHandle } from '@frontend/common/src/modules/handlers/balanceMonitor/ModuleDeleteAutoTransferRuleHandle';
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

const createFail = FailFactory('DeleteAutoTransferRuleUpdate');
const descFactory = ValueDescriptorFactory<
    true,
    TFail<'[DeleteAutoTransferRuleUpdate]: UNKNOWN'>
>();

type TDeleteAutoTransferRuleDescriptor = ExtractValueDescriptor<typeof descFactory>;

export const ModuleDeleteAutoTransferRuleAction = ModuleFactory((ctx: TContextRef) => {
    const { currentSocketUrl$ } = ModuleSocketPage(ctx);
    const deleteAutoTransferRuleHandle = ModuleDeleteAutoTransferRuleHandle(ctx);
    const { loading, success } = ModuleMessages(ctx);
    const notify = ModuleNotifications(ctx);

    return {
        deleteAutoTransferRule(
            id: TRuleId,
            traceId: TraceId,
        ): Observable<TDeleteAutoTransferRuleDescriptor> {
            const closeLoading = loading('Deleting auto transfer rule...');

            return currentSocketUrl$.pipe(
                first((url): url is TSocketURL => url !== undefined),
                switchMap((url) =>
                    deleteAutoTransferRuleHandle(url, { id }, { traceId }).pipe(
                        map((): TDeleteAutoTransferRuleDescriptor => {
                            void success('Auto transfer rule removed successfully');
                            return descFactory.sync(true, null);
                        }),
                        catchError((err) => {
                            notify.error({
                                ...getNotificationError('Failed to delete auto transfer rule', err),
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
