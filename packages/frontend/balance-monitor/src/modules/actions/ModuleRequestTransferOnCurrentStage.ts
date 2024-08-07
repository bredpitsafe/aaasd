import type { TContextRef } from '@frontend/common/src/di';
import { ModuleSocketPage } from '@frontend/common/src/modules/socketPage';
import type { TTransferAction } from '@frontend/common/src/types/domain/balanceMonitor/defs';
import type { TSocketURL } from '@frontend/common/src/types/domain/sockets';
import { createObservableProcedure } from '@frontend/common/src/utils/LPC/createObservableProcedure.ts';
import { mapValueDescriptor } from '@frontend/common/src/utils/Rx/ValueDescriptor2.ts';
import type { TValueDescriptor2 } from '@frontend/common/src/utils/ValueDescriptor/types.ts';
import { createSyncedValueDescriptor } from '@frontend/common/src/utils/ValueDescriptor/utils.ts';
import type { Observable } from 'rxjs';
import { first, switchMap } from 'rxjs/operators';

import { ModuleRequestTransfer } from './ModuleRequestTransfer';

type TRequestTransferDescriptor = TValueDescriptor2<true>;

export const ModuleRequestTransferOnCurrentStage = createObservableProcedure((ctx: TContextRef) => {
    const requestTransfer = ModuleRequestTransfer(ctx);
    const { currentSocketUrl$ } = ModuleSocketPage(ctx);

    return (props: TTransferAction, options): Observable<TRequestTransferDescriptor> => {
        return currentSocketUrl$.pipe(
            first((url): url is TSocketURL => url !== undefined),
            switchMap((target) =>
                requestTransfer({ target, ...props }, { ...options }).pipe(
                    mapValueDescriptor((): TRequestTransferDescriptor => {
                        return createSyncedValueDescriptor(true);
                    }),
                ),
            ),
        );
    };
});
