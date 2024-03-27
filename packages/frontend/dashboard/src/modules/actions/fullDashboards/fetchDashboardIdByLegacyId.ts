import { DEDUPE_REMOVE_DELAY, SHARE_RESET_DELAY } from '@frontend/common/src/defs/observables.ts';
import type { TContextRef } from '@frontend/common/src/di';
import type { TComponentId } from '@frontend/common/src/types/domain/component';
import type { TStorageDashboardId } from '@frontend/common/src/types/domain/dashboardsStorage.ts';
import { createObservableProcedure } from '@frontend/common/src/utils/LPC/createObservableProcedure.ts';
import { createRemoteProcedureCall } from '@frontend/common/src/utils/RPC/createRemoteProcedureCall.ts';
import { createRemoteProcedureDescriptor } from '@frontend/common/src/utils/RPC/createRemoteProcedureDescriptor.ts';
import {
    EPlatformSocketRemoteProcedureName,
    ERemoteProcedureType,
} from '@frontend/common/src/utils/RPC/defs.ts';
import { mapValueDescriptor } from '@frontend/common/src/utils/Rx/ValueDescriptor2.ts';
import { semanticHash } from '@frontend/common/src/utils/semanticHash.ts';
import { shallowHash } from '@frontend/common/src/utils/shallowHash.ts';
import { pipe } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { convertDashboardStorageErrorToGrpcError } from '../../../actors/FullDashboards/actions/dashboardsStorage/utils.ts';
import { ModuleServiceStage } from '../../serviceStage';

type TSendBody = {
    legacyId: TComponentId;
};

type TReceiveBody = {
    type: 'DashboardId';
    id: TStorageDashboardId;
};

const descriptor = createRemoteProcedureDescriptor<TSendBody, TReceiveBody>()(
    EPlatformSocketRemoteProcedureName.FetchDashboardIdByLegacyId,
    ERemoteProcedureType.Request,
);

const ModuleServerFetchDashboardIdByLegacyId = createRemoteProcedureCall(descriptor)({
    getPipe: () =>
        pipe(
            convertDashboardStorageErrorToGrpcError(),
            mapValueDescriptor(({ value }) => value.payload.id),
        ),
    dedobs: {
        normalize: ([props]) =>
            semanticHash.get(props, {
                target: semanticHash.withHasher(shallowHash),
            }),
        resetDelay: SHARE_RESET_DELAY,
        removeDelay: DEDUPE_REMOVE_DELAY,
    },
});

export const ModuleFetchDashboardIdByLegacyId = createObservableProcedure(
    (ctx: TContextRef) => {
        const { currentStage$ } = ModuleServiceStage(ctx);
        const fetch = ModuleServerFetchDashboardIdByLegacyId(ctx);
        return (params: TSendBody, options) => {
            return currentStage$.pipe(
                switchMap((stage) =>
                    fetch(
                        {
                            target: stage.url,
                            ...params,
                        },
                        options,
                    ),
                ),
            );
        };
    },
    {
        dedobs: {
            normalize: ([props]) =>
                semanticHash.get(props, {
                    target: semanticHash.withHasher(shallowHash),
                }),
            resetDelay: SHARE_RESET_DELAY,
            removeDelay: DEDUPE_REMOVE_DELAY,
        },
    },
);
