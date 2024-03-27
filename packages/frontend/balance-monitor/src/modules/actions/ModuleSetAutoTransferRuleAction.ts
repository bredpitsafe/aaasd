import type { TContextRef } from '@frontend/common/src/di';
import { ModuleFactory } from '@frontend/common/src/di';
import { ModuleMessages } from '@frontend/common/src/lib/messages';
import { ModuleSetAutoTransferRuleHandle } from '@frontend/common/src/modules/handlers/balanceMonitor/ModuleSetAutoTransferRuleHandle';
import { ModuleNotifications } from '@frontend/common/src/modules/notifications/module';
import { ModuleSocketPage } from '@frontend/common/src/modules/socketPage';
import type {
    TAutoTransferRuleCreate,
    TAutoTransferRuleUpdate,
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

const createFail = FailFactory('SetAutoTransferRuleUpdate');
const descFactory = ValueDescriptorFactory<true, TFail<'[SetAutoTransferRuleUpdate]: UNKNOWN'>>();

type TSetAutoTransferRuleDescriptor = ExtractValueDescriptor<typeof descFactory>;

export const ModuleSetAutoTransferRuleAction = ModuleFactory((ctx: TContextRef) => {
    const { currentSocketUrl$ } = ModuleSocketPage(ctx);
    const setTransferRuleHandle = ModuleSetAutoTransferRuleHandle(ctx);
    const { loading, success } = ModuleMessages(ctx);
    const notify = ModuleNotifications(ctx);

    return {
        setAutoTransferRule(
            props: TAutoTransferRuleCreate | TAutoTransferRuleUpdate,
            traceId: TraceId,
        ): Observable<TSetAutoTransferRuleDescriptor> {
            const closeLoading = loading(
                `${'id' in props ? 'Updating' : 'Creating'} auto transfer rule...`,
            );

            return currentSocketUrl$.pipe(
                first((url): url is TSocketURL => url !== undefined),
                switchMap((url) =>
                    setTransferRuleHandle(url, props, { traceId }).pipe(
                        map((): TSetAutoTransferRuleDescriptor => {
                            void success(
                                `Auto transfer rule ${
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
                                    } auto transfer rule`,
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
