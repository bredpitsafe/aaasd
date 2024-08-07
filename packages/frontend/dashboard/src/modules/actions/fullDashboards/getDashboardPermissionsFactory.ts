import { DEDUPE_REMOVE_DELAY, SHARE_RESET_DELAY } from '@frontend/common/src/defs/observables';
import type {
    TStorageDashboardId,
    TStorageDashboardPermission,
} from '@frontend/common/src/types/domain/dashboardsStorage';
import { getSocketUrlHash } from '@frontend/common/src/utils/hash/getSocketUrlHash.ts';
import { createObservableProcedure } from '@frontend/common/src/utils/LPC/createObservableProcedure.ts';
import { createRemoteProcedureCall } from '@frontend/common/src/utils/RPC/createRemoteProcedureCall.ts';
import { createRemoteProcedureDescriptor } from '@frontend/common/src/utils/RPC/createRemoteProcedureDescriptor.ts';
import {
    EPlatformSocketRemoteProcedureName,
    ERemoteProcedureType,
} from '@frontend/common/src/utils/RPC/defs.ts';
import { mapValueDescriptor } from '@frontend/common/src/utils/Rx/ValueDescriptor2.ts';
import { semanticHash } from '@frontend/common/src/utils/semanticHash.ts';
import { pick } from 'lodash-es';
import { pipe } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { convertDashboardStorageErrorToGrpcError } from '../../../actors/FullDashboards/actions/dashboardsStorage/utils.ts';
import { ModuleServiceStage } from '../../serviceStage';

type TSendBody = {
    id: TStorageDashboardId;
};

type TReceiveBody = {
    type: 'DashboardPermissionsList';
    list: TStorageDashboardPermission[];
};

const descriptor = createRemoteProcedureDescriptor<TSendBody, TReceiveBody>()(
    EPlatformSocketRemoteProcedureName.SubscribeToDashboardPermissions,
    ERemoteProcedureType.Subscribe,
);

const ModuleSubscribeToDashboardPermissionsHandler = createRemoteProcedureCall(descriptor)({
    getParams: (params) => pick(params, 'target', 'id'),
    getPipe: () => {
        return pipe(
            convertDashboardStorageErrorToGrpcError(),
            mapValueDescriptor(({ value }) => value.payload.list),
        );
    },
    dedobs: {
        normalize: ([params]) =>
            semanticHash.get(pick(params, 'target', 'id'), {
                target: semanticHash.withHasher(getSocketUrlHash),
            }),
        resetDelay: SHARE_RESET_DELAY,
        removeDelay: DEDUPE_REMOVE_DELAY,
    },
});

export const ModuleSubscribeToDashboardPermissions = createObservableProcedure(
    (ctx) => {
        const { currentStage$ } = ModuleServiceStage(ctx);
        const subscribe = ModuleSubscribeToDashboardPermissionsHandler(ctx);

        return (params: TSendBody, options) => {
            return currentStage$.pipe(
                switchMap((stage) => subscribe({ ...params, target: stage.url }, options)),
            );
        };
    },
    {
        dedobs: {
            normalize: ([params]) => semanticHash.get(pick(params, 'id'), {}),
            resetDelay: SHARE_RESET_DELAY,
            removeDelay: DEDUPE_REMOVE_DELAY,
        },
    },
);
