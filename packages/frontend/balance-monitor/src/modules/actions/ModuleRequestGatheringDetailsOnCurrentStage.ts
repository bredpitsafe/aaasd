import { DEDUPE_REMOVE_DELAY, SHARE_RESET_DELAY } from '@frontend/common/src/defs/observables.ts';
import type { TContextRef } from '@frontend/common/src/di';
import { ModuleSocketPage } from '@frontend/common/src/modules/socketPage';
import type { TExchangeId } from '@frontend/common/src/types/domain/balanceMonitor/defs.ts';
import type { TSocketURL } from '@frontend/common/src/types/domain/sockets.ts';
import { createObservableProcedure } from '@frontend/common/src/utils/LPC/createObservableProcedure.ts';
import { constantNormalizer } from '@frontend/common/src/utils/observable/memo.ts';
import { mapValueDescriptor } from '@frontend/common/src/utils/Rx/ValueDescriptor2.ts';
import type { TValueDescriptor2 } from '@frontend/common/src/utils/ValueDescriptor/types.ts';
import { createSyncedValueDescriptor } from '@frontend/common/src/utils/ValueDescriptor/utils.ts';
import type { Observable } from 'rxjs';
import { filter, switchMap } from 'rxjs/operators';

import { ModuleRequestGatheringDetails } from './ModuleRequestGatheringDetails.ts';

type TGatheringDetailsDescriptor = TValueDescriptor2<TExchangeId[]>;

export const ModuleRequestGatheringDetailsOnCurrentStage = createObservableProcedure(
    (ctx: TContextRef) => {
        return (_, options): Observable<TGatheringDetailsDescriptor> => {
            const requestGatheringDetails = ModuleRequestGatheringDetails(ctx);
            const { currentSocketUrl$ } = ModuleSocketPage(ctx);

            return currentSocketUrl$.pipe(
                filter((url): url is TSocketURL => url !== undefined),
                switchMap((target) =>
                    requestGatheringDetails(
                        { target },
                        { ...options, skipAuthentication: false },
                    ).pipe(
                        mapValueDescriptor(({ value }) =>
                            createSyncedValueDescriptor(value.exchanges),
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
