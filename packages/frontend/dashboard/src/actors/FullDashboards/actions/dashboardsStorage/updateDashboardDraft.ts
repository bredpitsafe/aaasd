import type {
    TStorageDashboardConfig,
    TStorageDashboardId,
} from '@frontend/common/src/types/domain/dashboardsStorage';
import { createObservableProcedure } from '@frontend/common/src/utils/LPC/createObservableProcedure.ts';
import { createRemoteProcedureCall } from '@frontend/common/src/utils/RPC/createRemoteProcedureCall.ts';
import { createRemoteProcedureDescriptor } from '@frontend/common/src/utils/RPC/createRemoteProcedureDescriptor.ts';
import {
    EPlatformSocketRemoteProcedureName,
    ERemoteProcedureType,
} from '@frontend/common/src/utils/RPC/defs.ts';
import { mapValueDescriptor } from '@frontend/common/src/utils/Rx/ValueDescriptor2.ts';
import { createSyncedValueDescriptor } from '@frontend/common/src/utils/ValueDescriptor/utils.ts';
import { first, switchMap } from 'rxjs/operators';

import { ModuleServiceStage } from '../../../../modules/serviceStage';
import { convertDashboardStorageErrorToGrpcError } from './utils';

type TSendBody = {
    id: TStorageDashboardId;
    config: TStorageDashboardConfig;
};

type TReceiveBody = {
    type: 'DashboardDraftUpdated';
};

const descriptor = createRemoteProcedureDescriptor<TSendBody, TReceiveBody>()(
    EPlatformSocketRemoteProcedureName.UpdateDashboardDraft,
    ERemoteProcedureType.Update,
);

const ModuleServerUpdateDashboardDraft = createRemoteProcedureCall(descriptor)({
    getPipe: () => convertDashboardStorageErrorToGrpcError(),
});

export const ModuleUpdateDashboardDraft = createObservableProcedure((ctx) => {
    const { currentStage$ } = ModuleServiceStage(ctx);
    const update = ModuleServerUpdateDashboardDraft(ctx);

    return (params: TSendBody, options) => {
        return currentStage$.pipe(
            first(),
            switchMap((stage) =>
                update(
                    {
                        target: stage.url,
                        ...params,
                    },
                    options,
                ).pipe(mapValueDescriptor(() => createSyncedValueDescriptor(true))),
            ),
        );
    };
});
