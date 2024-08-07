import type {
    EStorageDashboardKind,
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
import { pipe } from 'rxjs';
import { first, switchMap } from 'rxjs/operators';

import { convertDashboardStorageErrorToGrpcError } from '../../../actors/FullDashboards/actions/dashboardsStorage/utils.ts';
import type { TStorageDashboardItemKey } from '../../../types/fullDashboard';
import { ModuleServiceStage } from '../../serviceStage';

type TSendBody = {
    name: string;
    config: TStorageDashboardConfig;
    kind?: EStorageDashboardKind;
    status?: EStorageDashboardStatus;
    legacyId?: number;
};

type TReceiveBody = {
    type: 'DashboardCreated';
    id: TStorageDashboardId;
};

const descriptor = createRemoteProcedureDescriptor<TSendBody, TReceiveBody>()(
    EPlatformSocketRemoteProcedureName.CreateDashboard,
    ERemoteProcedureType.Update,
);

const ModuleCreateDashboardHandler = createRemoteProcedureCall(descriptor)({
    getPipe: () =>
        pipe(
            convertDashboardStorageErrorToGrpcError(),
            mapValueDescriptor(({ value: envelope }) => {
                return createSyncedValueDescriptor<TStorageDashboardItemKey>({
                    storageId: envelope.payload.id,
                });
            }),
        ),
});

export const ModuleCreateDashboard = createObservableProcedure<
    {
        name: TStorageDashboardName;
        config: TStorageDashboardConfig;
        kind?: EStorageDashboardKind;
        status?: EStorageDashboardStatus;
    },
    TValueDescriptor2<TStorageDashboardItemKey>
>((ctx) => {
    const createDashboard = ModuleCreateDashboardHandler(ctx);
    const { currentStage$ } = ModuleServiceStage(ctx);

    return (params, options) => {
        return currentStage$.pipe(
            first(),
            switchMap((stage) =>
                createDashboard(
                    {
                        target: stage.url,
                        name: params.name,
                        kind: params.kind,
                        status: params.status,
                        config: params.config,
                    },
                    options,
                ),
            ),
        );
    };
});
