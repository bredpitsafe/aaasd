import type { TContextRef } from '@frontend/common/src/di';
import { ModuleSocketPage } from '@frontend/common/src/modules/socketPage';
import type {
    TAmount,
    TCoinId,
    TExchangeId,
} from '@frontend/common/src/types/domain/balanceMonitor/defs';
import type { TSocketURL } from '@frontend/common/src/types/domain/sockets';
import { createObservableProcedure } from '@frontend/common/src/utils/LPC/createObservableProcedure.ts';
import { mapValueDescriptor } from '@frontend/common/src/utils/Rx/ValueDescriptor2.ts';
import type { TValueDescriptor2 } from '@frontend/common/src/utils/ValueDescriptor/types.ts';
import { createSyncedValueDescriptor } from '@frontend/common/src/utils/ValueDescriptor/utils.ts';
import type { Observable } from 'rxjs';
import { first, switchMap } from 'rxjs/operators';

import { ModuleStartGathering } from './ModuleStartGathering';

type TStartGatheringDescriptor = TValueDescriptor2<true>;

export const ModuleStartGatheringOnCurrentStage = createObservableProcedure((ctx: TContextRef) => {
    const startGathering = ModuleStartGathering(ctx);
    const { currentSocketUrl$ } = ModuleSocketPage(ctx);

    return (
        props: {
            exchange: TExchangeId;
            coin: TCoinId;
            amount: TAmount;
        },
        options,
    ): Observable<TStartGatheringDescriptor> => {
        return currentSocketUrl$.pipe(
            first((url): url is TSocketURL => url !== undefined),
            switchMap((target) =>
                startGathering(
                    { ...props, target },
                    { ...options, skipAuthentication: false },
                ).pipe(
                    mapValueDescriptor((): TStartGatheringDescriptor => {
                        return createSyncedValueDescriptor(true as const);
                    }),
                ),
            ),
        );
    };
});
