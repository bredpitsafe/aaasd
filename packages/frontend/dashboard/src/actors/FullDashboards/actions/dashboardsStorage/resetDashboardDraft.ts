import type { TContextRef } from '@frontend/common/src/di';
import type { TStorageDashboardId } from '@frontend/common/src/types/domain/dashboardsStorage';
import { createObservableProcedure } from '@frontend/common/src/utils/LPC/createObservableProcedure.ts';
import { createRemoteProcedureCall } from '@frontend/common/src/utils/RPC/createRemoteProcedureCall.ts';
import { createRemoteProcedureDescriptor } from '@frontend/common/src/utils/RPC/createRemoteProcedureDescriptor.ts';
import {
    EPlatformSocketRemoteProcedureName,
    ERemoteProcedureType,
} from '@frontend/common/src/utils/RPC/defs';
import { mapValueDescriptor } from '@frontend/common/src/utils/Rx/ValueDescriptor2.ts';
import { createSyncedValueDescriptor } from '@frontend/common/src/utils/ValueDescriptor/utils.ts';
import { first, switchMap } from 'rxjs/operators';

import { ModuleServiceStage } from '../../../../modules/serviceStage';
import { convertDashboardStorageErrorToGrpcError } from './utils.ts';

type TSendBody = {
    id: TStorageDashboardId;
};

type TReceiveBody = {
    type: 'DashboardDraftReset';
};

const descriptor = createRemoteProcedureDescriptor<TSendBody, TReceiveBody>()(
    EPlatformSocketRemoteProcedureName.ResetDashboardDraft,
    ERemoteProcedureType.Update,
);

const ModuleResetDashboardDraftHandler = createRemoteProcedureCall(descriptor)({
    getPipe: () => convertDashboardStorageErrorToGrpcError(),
});

export const ModuleResetDashboardDraft = createObservableProcedure((ctx: TContextRef) => {
    const { currentStage$ } = ModuleServiceStage(ctx);
    const reset = ModuleResetDashboardDraftHandler(ctx);

    return (params: TSendBody, options) => {
        return currentStage$.pipe(
            first(),
            switchMap((stage) =>
                reset(
                    {
                        ...params,
                        target: stage.url,
                    },
                    options,
                ).pipe(mapValueDescriptor(() => createSyncedValueDescriptor(true as const))),
            ),
        );
    };
});
