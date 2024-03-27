import type { TContextRef } from '@frontend/common/src/di';
import { ModuleFactory } from '@frontend/common/src/di';
import { ModuleMessages } from '@frontend/common/src/lib/messages';
import { ModuleDeleteLimitingTransferRuleHandle } from '@frontend/common/src/modules/handlers/balanceMonitor/ModuleDeleteLimitingTransferRuleHandle';
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

const createFail = FailFactory('DeleteAmountLimitsRuleUpdate');
const descFactory = ValueDescriptorFactory<
    true,
    TFail<'[DeleteAmountLimitsRuleUpdate]: UNKNOWN'>
>();

type TDeleteAmountLimitsRuleDescriptor = ExtractValueDescriptor<typeof descFactory>;

export const ModuleDeleteAmountLimitsRuleAction = ModuleFactory((ctx: TContextRef) => {
    const { currentSocketUrl$ } = ModuleSocketPage(ctx);
    const { loading, success } = ModuleMessages(ctx);
    const notify = ModuleNotifications(ctx);
    const deleteAmountLimitsRuleHandle = ModuleDeleteLimitingTransferRuleHandle(ctx);

    return {
        deleteAmountLimitsRule(
            id: TRuleId,
            traceId: TraceId,
        ): Observable<TDeleteAmountLimitsRuleDescriptor> {
            const closeLoading = loading('Deleting amount limits rule...');

            return currentSocketUrl$.pipe(
                first((url): url is TSocketURL => url !== undefined),
                switchMap((url) =>
                    deleteAmountLimitsRuleHandle(url, { id }, { traceId }).pipe(
                        map((): TDeleteAmountLimitsRuleDescriptor => {
                            void success('Amount limits rule removed successfully');
                            return descFactory.sync(true, null);
                        }),
                        catchError((err) => {
                            notify.error({
                                ...getNotificationError('Failed to delete amount limits rule', err),
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
