import type { TContextRef } from '@frontend/common/src/di';
import type {
    TStorageDashboardId,
    TStorageDashboardName,
} from '@frontend/common/src/types/domain/dashboardsStorage';
import { createObservableProcedure } from '@frontend/common/src/utils/LPC/createObservableProcedure.ts';
import { createRemoteProcedureCall } from '@frontend/common/src/utils/RPC/createRemoteProcedureCall.ts';
import { createRemoteProcedureDescriptor } from '@frontend/common/src/utils/RPC/createRemoteProcedureDescriptor.ts';
import {
    EPlatformSocketRemoteProcedureName,
    ERemoteProcedureType,
} from '@frontend/common/src/utils/RPC/defs.ts';
import { mapValueDescriptor } from '@frontend/common/src/utils/Rx/ValueDescriptor2.ts';
import { createSyncedValueDescriptor } from '@frontend/common/src/utils/ValueDescriptor/utils';
import { pipe } from 'rxjs';
import { first, switchMap } from 'rxjs/operators';

import { ModuleServiceStage } from '../../../../modules/serviceStage';
import { convertDashboardStorageErrorToGrpcError } from './utils.ts';

type TSendBody = {
    id: TStorageDashboardId;
    name: TStorageDashboardName;
};

type TReceiveBody = {
    type: 'DashboardRenamed';
};

const descriptor = createRemoteProcedureDescriptor<TSendBody, TReceiveBody>()(
    EPlatformSocketRemoteProcedureName.RenameDashboard,
    ERemoteProcedureType.Update,
);

const ModuleServerRenameDashboard = createRemoteProcedureCall(descriptor)({
    getPipe: () =>
        pipe(
            convertDashboardStorageErrorToGrpcError(),
            mapValueDescriptor(() => createSyncedValueDescriptor(true as const)),
        ),
});

export const ModuleRenameDashboard = createObservableProcedure((ctx: TContextRef) => {
    const { currentStage$ } = ModuleServiceStage(ctx);
    const rename = ModuleServerRenameDashboard(ctx);

    return (params: TSendBody, options) => {
        return currentStage$.pipe(
            first(),
            switchMap((stage) =>
                rename(
                    {
                        ...params,
                        target: stage.url,
                    },
                    options,
                ),
            ),
        );
    };
});
