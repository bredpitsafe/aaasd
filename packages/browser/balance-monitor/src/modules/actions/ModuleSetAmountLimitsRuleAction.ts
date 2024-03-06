import type { TContextRef } from '@frontend/common/src/di';
import { ModuleFactory } from '@frontend/common/src/di';
import { ModuleMessages } from '@frontend/common/src/lib/messages';
import { ModuleSetLimitingTransferRuleHandle } from '@frontend/common/src/modules/handlers/balanceMonitor/ModuleSetLimitingTransferRuleHandle';
import { ModuleNotifications } from '@frontend/common/src/modules/notifications/module';
import { ModuleSocketPage } from '@frontend/common/src/modules/socketPage';
import type {
    TAmountLimitsRuleCreate,
    TAmountLimitsRuleUpdate,
} from '@frontend/common/src/types/domain/balanceMonitor/defs';
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

const createFail = FailFactory('SetAmountLimitsRuleUpdate');
const descFactory = ValueDescriptorFactory<true, TFail<'[SetAmountLimitsRuleUpdate]: UNKNOWN'>>();

type TSetAmountLimitsRuleDescriptor = ExtractValueDescriptor<typeof descFactory>;

export const ModuleSetAmountLimitsRuleAction = ModuleFactory((ctx: TContextRef) => {
    const { currentSocketUrl$ } = ModuleSocketPage(ctx);
    const setLimitingTransferRuleHandle = ModuleSetLimitingTransferRuleHandle(ctx);
    const { loading, success } = ModuleMessages(ctx);
    const notify = ModuleNotifications(ctx);

    return {
        setAmountLimitsRule(
            props: TAmountLimitsRuleCreate | TAmountLimitsRuleUpdate,
            traceId: TraceId,
        ): Observable<TSetAmountLimitsRuleDescriptor> {
            const closeLoading = loading(
                `${'id' in props ? 'Updating' : 'Creating'} amount limits rule...`,
            );

            return currentSocketUrl$.pipe(
                first((url): url is TSocketURL => url !== undefined),
                switchMap((url) =>
                    setLimitingTransferRuleHandle(url, props, { traceId }).pipe(
                        map((): TSetAmountLimitsRuleDescriptor => {
                            void success(
                                `Amount limits rule ${
                                    'id' in props ? 'updated' : 'created'
                                } successfully`,
                            );
                            return descFactory.sync(true, null);
                        }),
                        catchError((err) => {
                            notify.error({
                                ...getNotificationError(
                                    `Failed to ${
                                        'id' in props ? 'update' : 'create'
                                    } amount limits rule`,
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
