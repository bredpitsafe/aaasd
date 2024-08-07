import type {
    TStorageDashboardId,
    TStorageDashboardPermission,
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
import { of } from 'rxjs';
import { first, switchMap } from 'rxjs/operators';

import { convertDashboardStorageErrorToGrpcError } from '../../../actors/FullDashboards/actions/dashboardsStorage/utils.ts';
import type { TDashboardItemKey, TStorageDashboardItemKey } from '../../../types/fullDashboard';
import { isStorageDashboardItemKey } from '../../../types/fullDashboard/guards.ts';
import { ModuleServiceStage } from '../../serviceStage';

type TSendBody = {
    id: TStorageDashboardId;
    permissions: TStorageDashboardPermission[];
};

type TReceiveBody = {
    type: 'DashboardPermissionsUpdated';
};

const descriptor = createRemoteProcedureDescriptor<TSendBody, TReceiveBody>()(
    EPlatformSocketRemoteProcedureName.UpdateDashboardPermissions,
    ERemoteProcedureType.Update,
);

const ModuleUpdateDashboardPermissionsHandler = createRemoteProcedureCall(descriptor)({
    getPipe: () => convertDashboardStorageErrorToGrpcError(),
});

export const ModuleUpdateDashboardPermissions = createObservableProcedure((ctx) => {
    const { currentStage$ } = ModuleServiceStage(ctx);
    const update = ModuleUpdateDashboardPermissionsHandler(ctx);

    return (
        params: {
            itemKey: TDashboardItemKey;
            permissions: TStorageDashboardPermission[];
        },
        options,
    ) => {
        if (!isStorageDashboardItemKey(params.itemKey)) {
            return of(createSyncedValueDescriptor(false));
        }

        return currentStage$.pipe(
            first(),
            switchMap((stage) =>
                update(
                    {
                        target: stage.url,
                        id: (params.itemKey as TStorageDashboardItemKey).storageId,
                        permissions: params.permissions,
                    },
                    options,
                ).pipe(mapValueDescriptor(() => createSyncedValueDescriptor(true))),
            ),
        );
    };
});
