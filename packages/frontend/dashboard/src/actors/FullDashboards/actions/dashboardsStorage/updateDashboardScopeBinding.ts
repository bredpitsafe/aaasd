import type {
    TScope,
    TStorageDashboardId,
} from '@frontend/common/src/types/domain/dashboardsStorage.ts';
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
import { convertDashboardStorageErrorToGrpcError } from './utils.ts';

export type TUpdateBindingSendBody = {
    dashboardId: TStorageDashboardId;
    scope: TScope;
    action: 'bind' | 'unbind';
};

type TReceiveBody = {
    type: 'DashboardScopeBindingUpdated';
};

const descriptor = createRemoteProcedureDescriptor<TUpdateBindingSendBody, TReceiveBody>()(
    EPlatformSocketRemoteProcedureName.UpdateDashboardScopeBinding,
    ERemoteProcedureType.Update,
);

const ModuleUpdateDashboardScopeBindingHandler = createRemoteProcedureCall(descriptor)({
    getPipe: () => convertDashboardStorageErrorToGrpcError(),
});

export const ModuleUpdateDashboardScopeBinding = createObservableProcedure<
    TUpdateBindingSendBody,
    TValueDescriptor2<true>
>((ctx) => {
    const updateDashboardScopeBinding = ModuleUpdateDashboardScopeBindingHandler(ctx);
    const { currentStage$ } = ModuleServiceStage(ctx);

    return (params, options) => {
        return currentStage$.pipe(
            first(),
            switchMap((stage) => {
                return updateDashboardScopeBinding(
                    {
                        target: stage.url,
                        ...params,
                    },
                    options,
                ).pipe(mapValueDescriptor(() => createSyncedValueDescriptor(true as const)));
            }),
        );
    };
});
