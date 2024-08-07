import type { TStorageDashboardId } from '@frontend/common/src/types/domain/dashboardsStorage';
import { createObservableProcedure } from '@frontend/common/src/utils/LPC/createObservableProcedure.ts';
import { createRemoteProcedureCall } from '@frontend/common/src/utils/RPC/createRemoteProcedureCall.ts';
import { createRemoteProcedureDescriptor } from '@frontend/common/src/utils/RPC/createRemoteProcedureDescriptor.ts';
import {
    EPlatformSocketRemoteProcedureName,
    ERemoteProcedureType,
} from '@frontend/common/src/utils/RPC/defs';
import { first, switchMap } from 'rxjs/operators';

import { ModuleServiceStage } from '../../../../modules/serviceStage';
import { convertDashboardStorageErrorToGrpcError } from './utils.ts';

type TSendBody = {
    id: TStorageDashboardId;
};

type TReceiveBody = {
    type: 'DashboardDeleted';
};

const descriptor = createRemoteProcedureDescriptor<TSendBody, TReceiveBody>()(
    EPlatformSocketRemoteProcedureName.DeleteDashboard,
    ERemoteProcedureType.Update,
);
const ModuleServerDeleteDashboard = createRemoteProcedureCall(descriptor)({
    getPipe: () => convertDashboardStorageErrorToGrpcError(),
});

export const ModuleDeleteDashboard = createObservableProcedure((ctx) => {
    const { currentStage$ } = ModuleServiceStage(ctx);
    const remove = ModuleServerDeleteDashboard(ctx);

    return (params: TSendBody, options) => {
        return currentStage$.pipe(
            first(),
            switchMap((stage) =>
                remove(
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
