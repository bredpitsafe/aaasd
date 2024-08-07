import { DEDUPE_REMOVE_DELAY } from '@frontend/common/src/defs/observables';
import type {
    TStorageDashboard,
    TStorageDashboardId,
} from '@frontend/common/src/types/domain/dashboardsStorage';
import { getSocketUrlHash } from '@frontend/common/src/utils/hash/getSocketUrlHash.ts';
import { createObservableProcedure } from '@frontend/common/src/utils/LPC/createObservableProcedure.ts';
import { createRemoteProcedureCall } from '@frontend/common/src/utils/RPC/createRemoteProcedureCall.ts';
import { createRemoteProcedureDescriptor } from '@frontend/common/src/utils/RPC/createRemoteProcedureDescriptor.ts';
import {
    EPlatformSocketRemoteProcedureName,
    ERemoteProcedureType,
} from '@frontend/common/src/utils/RPC/defs';
import { mapValueDescriptor } from '@frontend/common/src/utils/Rx/ValueDescriptor2.ts';
import { semanticHash } from '@frontend/common/src/utils/semanticHash.ts';
import { pipe } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { ModuleServiceStage } from '../../../../modules/serviceStage';
import { convertDashboardStorageErrorToGrpcError } from './utils';

type TSendBody = {
    id: TStorageDashboardId;
};

type TReceiveBody = {
    type: 'Dashboard';
    dashboard: TStorageDashboard;
};

const descriptor = createRemoteProcedureDescriptor<TSendBody, TReceiveBody>()(
    EPlatformSocketRemoteProcedureName.SubscribeToDashboard,
    ERemoteProcedureType.Subscribe,
);
const ModuleServerSubscribeToDashboard = createRemoteProcedureCall(descriptor)({
    getPipe: () => {
        return pipe(
            convertDashboardStorageErrorToGrpcError(),
            mapValueDescriptor(({ value }) => value.payload.dashboard),
        );
    },
    dedobs: {
        normalize: ([props]) =>
            semanticHash.get(props, {
                target: semanticHash.withHasher(getSocketUrlHash),
            }),
        resetDelay: 0,
        removeDelay: DEDUPE_REMOVE_DELAY,
    },
});

export const ModuleSubscribeToDashboard = createObservableProcedure(
    (ctx) => {
        const { currentStage$ } = ModuleServiceStage(ctx);
        const subscribe = ModuleServerSubscribeToDashboard(ctx);

        return (params: TSendBody, options) => {
            return currentStage$.pipe(
                switchMap((stage) =>
                    subscribe(
                        { ...params, target: stage.url },
                        { ...options, enableRetries: false },
                    ),
                ),
            );
        };
    },
    {
        dedobs: {
            normalize: ([props]) => semanticHash.get(props, {}),
            resetDelay: 0,
            removeDelay: DEDUPE_REMOVE_DELAY,
        },
    },
);
