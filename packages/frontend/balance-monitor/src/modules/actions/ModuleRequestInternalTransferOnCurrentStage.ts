import type { TContextRef } from '@frontend/common/src/di';
import { ModuleSocketPage } from '@frontend/common/src/modules/socketPage';
import type { TInternalTransferAction } from '@frontend/common/src/types/domain/balanceMonitor/defs';
import type { TSocketURL } from '@frontend/common/src/types/domain/sockets';
import { createObservableProcedure } from '@frontend/common/src/utils/LPC/createObservableProcedure.ts';
import { mapValueDescriptor } from '@frontend/common/src/utils/Rx/ValueDescriptor2.ts';
import type { TValueDescriptor2 } from '@frontend/common/src/utils/ValueDescriptor/types.ts';
import { createSyncedValueDescriptor } from '@frontend/common/src/utils/ValueDescriptor/utils.ts';
import type { Observable } from 'rxjs';
import { first, switchMap } from 'rxjs/operators';

import { ModuleRequestInternalTransfer } from './ModuleRequestInternalTransfer';

type TRequestInternalTransferDescriptor = TValueDescriptor2<true>;

export const ModuleRequestInternalTransferOnCurrentStage = createObservableProcedure(
    (ctx: TContextRef) => {
        const { currentSocketUrl$ } = ModuleSocketPage(ctx);
        const requestInternalTransfer = ModuleRequestInternalTransfer(ctx);

        return (
            props: TInternalTransferAction,
            options,
        ): Observable<TRequestInternalTransferDescriptor> => {
            return currentSocketUrl$.pipe(
                first((url): url is TSocketURL => url !== undefined),
                switchMap((target) =>
                    requestInternalTransfer(
                        { target, ...props },
                        { ...options, skipAuthentication: false },
                    ).pipe(
                        mapValueDescriptor((): TRequestInternalTransferDescriptor => {
                            return createSyncedValueDescriptor(true);
                        }),
                    ),
                ),
            );
        };
    },
);
