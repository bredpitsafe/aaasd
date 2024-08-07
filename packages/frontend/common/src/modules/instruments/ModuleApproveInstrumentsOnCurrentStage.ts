import type { TContextRef } from '@frontend/common/src/di';
import { createObservableProcedure } from '@frontend/common/src/utils/LPC/createObservableProcedure.ts';
import type { TValueDescriptor2 } from '@frontend/common/src/utils/ValueDescriptor/types.ts';
import { createSyncedValueDescriptor } from '@frontend/common/src/utils/ValueDescriptor/utils.ts';
import type { Observable } from 'rxjs';
import { combineLatest } from 'rxjs';
import { first, switchMap } from 'rxjs/operators';

import { mapValueDescriptor } from '../../utils/Rx/ValueDescriptor2.ts';
import { ModuleBFF } from '../bff';
import { ModuleMock } from '../mock';
import { ModuleApproveInstruments } from './ModuleApproveInstruments.ts';

export const ModuleApproveInstrumentsOnCurrentStage = createObservableProcedure(
    (ctx: TContextRef) => {
        const approveInstruments = ModuleApproveInstruments(ctx);

        const { getCurrentBFFSocket$ } = ModuleBFF(ctx);
        const { mock$ } = ModuleMock(ctx);

        const bffSocket$ = getCurrentBFFSocket$();

        return (instrumentIds: number[], options): Observable<TValueDescriptor2<boolean>> =>
            combineLatest([bffSocket$, mock$]).pipe(
                first(),
                switchMap(([bffSocket, mock]) =>
                    approveInstruments(
                        {
                            type: 'ApproveInstrument',
                            target: bffSocket,
                            mock,
                            targets: instrumentIds.map((instrumentId) => ({
                                id: { type: 'instrumentId', instrumentId },
                                revisionPlatformTime: undefined,
                            })),
                        },
                        { traceId: options.traceId },
                    ),
                ),
                mapValueDescriptor(() => createSyncedValueDescriptor(true)),
            );
    },
);
