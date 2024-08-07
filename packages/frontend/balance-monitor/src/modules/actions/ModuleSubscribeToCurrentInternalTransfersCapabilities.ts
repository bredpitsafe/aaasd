import type { TSubscriptionEventSubscribed } from '@common/rx';
import { isSubscriptionEventUpdate } from '@common/rx';
import { DEDUPE_REMOVE_DELAY, SHARE_RESET_DELAY } from '@frontend/common/src/defs/observables.ts';
import type { TContextRef } from '@frontend/common/src/di';
import { ModuleSocketPage } from '@frontend/common/src/modules/socketPage';
import type { TPossibleInternalTransfer } from '@frontend/common/src/types/domain/balanceMonitor/defs.ts';
import type { TSocketURL } from '@frontend/common/src/types/domain/sockets.ts';
import { createObservableProcedure } from '@frontend/common/src/utils/LPC/createObservableProcedure.ts';
import { constantNormalizer } from '@frontend/common/src/utils/observable/memo.ts';
import { mapValueDescriptor } from '@frontend/common/src/utils/Rx/ValueDescriptor2.ts';
import type { TValueDescriptor2 } from '@frontend/common/src/utils/ValueDescriptor/types.ts';
import {
    createSyncedValueDescriptor,
    isSyncedValueDescriptor,
} from '@frontend/common/src/utils/ValueDescriptor/utils.ts';
import type { Observable } from 'rxjs';
import { filter, switchMap } from 'rxjs/operators';

import { ModuleSubscribeToInternalTransfersCapabilities } from './ModuleSubscribeToInternalTransfersCapabilities.ts';

type TInternalTransfersInfoDescriptor = TValueDescriptor2<TPossibleInternalTransfer[]>;

export const ModuleSubscribeToCurrentInternalTransfersCapabilities = createObservableProcedure(
    (ctx: TContextRef) => {
        const subscribeToInternalTransfersCapabilities =
            ModuleSubscribeToInternalTransfersCapabilities(ctx);
        const { currentSocketUrl$ } = ModuleSocketPage(ctx);

        return (_, options): Observable<TInternalTransfersInfoDescriptor> => {
            return currentSocketUrl$.pipe(
                filter((url): url is TSocketURL => url !== undefined),
                switchMap((target) =>
                    subscribeToInternalTransfersCapabilities(
                        { target },
                        { ...options, skipAuthentication: false },
                    ).pipe(
                        filter(
                            (
                                vd,
                            ): vd is Exclude<
                                typeof vd,
                                TValueDescriptor2<TSubscriptionEventSubscribed>
                            > =>
                                isSyncedValueDescriptor(vd)
                                    ? isSubscriptionEventUpdate(vd.value)
                                    : true,
                        ),
                        mapValueDescriptor(({ value }) =>
                            createSyncedValueDescriptor(value.payload),
                        ),
                    ),
                ),
            );
        };
    },
    {
        dedobs: {
            normalize: constantNormalizer,
            resetDelay: SHARE_RESET_DELAY,
            removeDelay: DEDUPE_REMOVE_DELAY,
        },
    },
);
