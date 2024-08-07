import type { TContextRef } from '@frontend/common/src/di';
import { ModuleSocketPage } from '@frontend/common/src/modules/socketPage';
import type { TCoinId, TExchangeId } from '@frontend/common/src/types/domain/balanceMonitor/defs';
import type { TSocketURL } from '@frontend/common/src/types/domain/sockets';
import { createObservableProcedure } from '@frontend/common/src/utils/LPC/createObservableProcedure.ts';
import { mapValueDescriptor } from '@frontend/common/src/utils/Rx/ValueDescriptor2.ts';
import type { TValueDescriptor2 } from '@frontend/common/src/utils/ValueDescriptor/types.ts';
import { createSyncedValueDescriptor } from '@frontend/common/src/utils/ValueDescriptor/utils.ts';
import type { Observable } from 'rxjs';
import { first, switchMap } from 'rxjs/operators';

import { ModuleStopGathering } from './ModuleStopGathering';

type TStopGatheringDescriptor = TValueDescriptor2<true>;

export const ModuleStopGatheringOnCurrentStage = createObservableProcedure((ctx: TContextRef) => {
    const stopGathering = ModuleStopGathering(ctx);
    const { currentSocketUrl$ } = ModuleSocketPage(ctx);

    return (
        props: {
            exchange: TExchangeId;
            coin: TCoinId;
        },
        options,
    ): Observable<TStopGatheringDescriptor> => {
        return currentSocketUrl$.pipe(
            first((url): url is TSocketURL => url !== undefined),
            switchMap((target) =>
                stopGathering({ ...props, target }, { ...options, skipAuthentication: false }).pipe(
                    mapValueDescriptor((): TStopGatheringDescriptor => {
                        return createSyncedValueDescriptor(true as const);
                    }),
                ),
            ),
        );
    };
});
