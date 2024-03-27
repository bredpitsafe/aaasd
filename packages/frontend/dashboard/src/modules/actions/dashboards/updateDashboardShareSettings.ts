import type {
    EStorageDashboardSharePermission,
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
import { of } from 'rxjs';
import { first, switchMap } from 'rxjs/operators';

import { convertDashboardStorageErrorToGrpcError } from '../../../actors/FullDashboards/actions/dashboardsStorage/utils.ts';
import type { TDashboardItemKey, TStorageDashboardItemKey } from '../../../types/fullDashboard';
import { isStorageDashboardItemKey } from '../../../types/fullDashboard/guards.ts';
import { ModuleServiceStage } from '../../serviceStage';

type TSendBody = {
    id: TStorageDashboardId;
    sharePermission: EStorageDashboardSharePermission;
};

type TReceiveBody = {
    type: 'DashboardShareSettingsUpdated';
};

const descriptor = createRemoteProcedureDescriptor<TSendBody, TReceiveBody>()(
    EPlatformSocketRemoteProcedureName.UpdateDashboardShareSettings,
    ERemoteProcedureType.Update,
);

const ModuleUpdateDashboardShareSettingsHandler = createRemoteProcedureCall(descriptor)({
    getPipe: () => convertDashboardStorageErrorToGrpcError(),
});

export const ModuleUpdateDashboardShareSettings = createObservableProcedure((ctx) => {
    const { currentStage$ } = ModuleServiceStage(ctx);
    const update = ModuleUpdateDashboardShareSettingsHandler(ctx);

    return (
        params: {
            itemKey: TDashboardItemKey;
            sharePermission: EStorageDashboardSharePermission;
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
                        sharePermission: params.sharePermission,
                    },
                    options,
                ).pipe(mapValueDescriptor(() => createSyncedValueDescriptor(true))),
            ),
        );
    };
});
