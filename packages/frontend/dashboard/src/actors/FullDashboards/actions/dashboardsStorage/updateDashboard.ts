import type {
    EStorageDashboardStatus,
    TStorageDashboardConfig,
    TStorageDashboardId,
    TStorageDashboardName,
} from '@frontend/common/src/types/domain/dashboardsStorage';
import { createObservableProcedure } from '@frontend/common/src/utils/LPC/createObservableProcedure';
import { createRemoteProcedureCall } from '@frontend/common/src/utils/RPC/createRemoteProcedureCall';
import { createRemoteProcedureDescriptor } from '@frontend/common/src/utils/RPC/createRemoteProcedureDescriptor';
import {
    EPlatformSocketRemoteProcedureName,
    ERemoteProcedureType,
} from '@frontend/common/src/utils/RPC/defs';
import { mapValueDescriptor } from '@frontend/common/src/utils/Rx/ValueDescriptor2.ts';
import type { TValueDescriptor2 } from '@frontend/common/src/utils/ValueDescriptor/types';
import { createSyncedValueDescriptor } from '@frontend/common/src/utils/ValueDescriptor/utils.ts';
import { first, switchMap } from 'rxjs/operators';

import { ModuleServiceStage } from '../../../../modules/serviceStage';
import type { TStorageDashboardItemKey } from '../../../../types/fullDashboard';
import { convertDashboardStorageErrorToGrpcError } from './utils.ts';

type TSendBody = {
    id: TStorageDashboardId;
    name: TStorageDashboardName;
    config: TStorageDashboardConfig;
    status: EStorageDashboardStatus;
    digest: string;
};

type TReceiveBody = {
    type: 'DashboardUpdated';
};

const descriptor = createRemoteProcedureDescriptor<TSendBody, TReceiveBody>()(
    EPlatformSocketRemoteProcedureName.UpdateDashboard,
    ERemoteProcedureType.Update,
);

const ModuleUpdateDashboardHandler = createRemoteProcedureCall(descriptor)({
    getPipe: () => convertDashboardStorageErrorToGrpcError(),
});

export const ModuleUpdateDashboard = createObservableProcedure<
    TSendBody,
    TValueDescriptor2<TStorageDashboardItemKey>
>((ctx) => {
    const updateDashboard = ModuleUpdateDashboardHandler(ctx);
    const { currentStage$ } = ModuleServiceStage(ctx);

    return (params, options) => {
        return currentStage$.pipe(
            first(),
            switchMap((stage) => {
                return updateDashboard(
                    {
                        target: stage.url,
                        ...params,
                    },
                    options,
                ).pipe(
                    mapValueDescriptor(() =>
                        createSyncedValueDescriptor({
                            storageId: params.id,
                        }),
                    ),
                );
            }),
        );
    };
});
