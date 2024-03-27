import type { TContextRef } from '@frontend/common/src/di';
import { ModuleFactory } from '@frontend/common/src/di';
import { ModuleMessages } from '@frontend/common/src/lib/messages';
import { ModuleSaveCoinStateHandle } from '@frontend/common/src/modules/handlers/balanceMonitor/ModuleSaveCoinStateHandle';
import { ModuleNotifications } from '@frontend/common/src/modules/notifications/module';
import { ModuleSocketPage } from '@frontend/common/src/modules/socketPage';
import type { TCoinId } from '@frontend/common/src/types/domain/balanceMonitor/defs';
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

const createFail = FailFactory('save_coin_state');
const descFactory = ValueDescriptorFactory<true, TFail<'[save_coin_state]: UNKNOWN'>>();

type TSaveCoinDescriptor = ExtractValueDescriptor<typeof descFactory>;

export const ModuleSaveCoinStateAction = ModuleFactory((ctx: TContextRef) => {
    const { currentSocketUrl$ } = ModuleSocketPage(ctx);
    const saveCoinStateHandle = ModuleSaveCoinStateHandle(ctx);
    const { loading, success } = ModuleMessages(ctx);
    const notify = ModuleNotifications(ctx);

    return {
        saveCoinState(
            coin: TCoinId,
            comment: string,
            traceId: TraceId,
        ): Observable<TSaveCoinDescriptor> {
            const closeLoading = loading('Saving coin state...');

            return currentSocketUrl$.pipe(
                first((url): url is TSocketURL => url !== undefined),
                switchMap((url) =>
                    saveCoinStateHandle(url, { coin, comment }, { traceId }).pipe(
                        map(() => {
                            void success('Coin state saved successfully');
                            return descFactory.sync(true, null);
                        }),
                        catchError((err) => {
                            notify.error({
                                ...getNotificationError('Failed to save coin state', err),
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
