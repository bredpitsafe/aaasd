import type { TContextRef } from '@frontend/common/src/di';
import { ModuleSocketPage } from '@frontend/common/src/modules/socketPage';
import type { TCoinId } from '@frontend/common/src/types/domain/balanceMonitor/defs';
import type { TSocketURL } from '@frontend/common/src/types/domain/sockets';
import { createObservableProcedure } from '@frontend/common/src/utils/LPC/createObservableProcedure.ts';
import { mapValueDescriptor } from '@frontend/common/src/utils/Rx/ValueDescriptor2.ts';
import type { TValueDescriptor2 } from '@frontend/common/src/utils/ValueDescriptor/types.ts';
import { createSyncedValueDescriptor } from '@frontend/common/src/utils/ValueDescriptor/utils.ts';
import type { Observable } from 'rxjs';
import { first, switchMap } from 'rxjs/operators';

import { ModuleSaveCoinState } from './ModuleSaveCoinState';

type TSaveCoinDescriptor = TValueDescriptor2<true>;

export const ModuleSaveCoinStateOnCurrentStage = createObservableProcedure((ctx: TContextRef) => {
    const saveCoinState = ModuleSaveCoinState(ctx);
    const { currentSocketUrl$ } = ModuleSocketPage(ctx);

    return (
        params: { coin: TCoinId; comment: string },
        options,
    ): Observable<TSaveCoinDescriptor> => {
        return currentSocketUrl$.pipe(
            first((url): url is TSocketURL => url !== undefined),
            switchMap((target) =>
                saveCoinState(
                    { target, ...params },
                    { ...options, skipAuthentication: false },
                ).pipe(
                    mapValueDescriptor(() => {
                        return createSyncedValueDescriptor(true as const);
                    }),
                ),
            ),
        );
    };
});
