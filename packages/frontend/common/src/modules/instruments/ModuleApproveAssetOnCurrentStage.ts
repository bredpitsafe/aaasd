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
import { ModuleApproveAsset } from './ModuleApproveAsset.ts';

export const ModuleApproveAssetOnCurrentStage = createObservableProcedure((ctx: TContextRef) => {
    const approveAsset = ModuleApproveAsset(ctx);

    const { getCurrentBFFSocket$ } = ModuleBFF(ctx);
    const { mock$ } = ModuleMock(ctx);

    const bffSocket$ = getCurrentBFFSocket$();

    return (assetName: string, options): Observable<TValueDescriptor2<boolean>> =>
        combineLatest([bffSocket$, mock$]).pipe(
            first(),
            switchMap(([bffSocket, mock]) =>
                approveAsset(
                    {
                        type: 'ApproveAsset',
                        target: bffSocket,
                        mock,
                        name: assetName,
                    },
                    { traceId: options.traceId },
                ),
            ),
            mapValueDescriptor(() => createSyncedValueDescriptor(true)),
        );
});
