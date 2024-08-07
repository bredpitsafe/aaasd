import { DEDUPE_REMOVE_DELAY, SHARE_RESET_DELAY } from '@frontend/common/src/defs/observables';
import type { TContextRef } from '@frontend/common/src/di';
import type {
    TStorageDashboardConfig,
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
import { pick } from 'lodash-es';
import { pipe } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { ModuleServiceStage } from '../../../../modules/serviceStage';
import { convertDashboardStorageErrorToGrpcError } from './utils.ts';

type TSendBody = {
    id: TStorageDashboardId;
    digest: string;
};

type TReceiveBody = {
    type: 'DashboardConfig';
    config: TStorageDashboardConfig;
};

const descriptor = createRemoteProcedureDescriptor<TSendBody, TReceiveBody>()(
    EPlatformSocketRemoteProcedureName.FetchDashboardConfig,
    ERemoteProcedureType.Request,
);

const ModuleServerFetchDashboardConfig = createRemoteProcedureCall(descriptor)({
    getParams: (params) => pick(params, 'target', 'id', 'digest'),
    getPipe: () =>
        pipe(
            convertDashboardStorageErrorToGrpcError(),
            mapValueDescriptor(({ value }) => value.payload.config),
        ),
    dedobs: {
        normalize: ([params]) =>
            semanticHash.get(pick(params, 'target', 'id', 'digest'), {
                target: semanticHash.withHasher(getSocketUrlHash),
            }),
        resetDelay: SHARE_RESET_DELAY,
        removeDelay: DEDUPE_REMOVE_DELAY,
    },
});

export const ModuleFetchDashboardConfig = createObservableProcedure(
    (ctx: TContextRef) => {
        const { currentStage$ } = ModuleServiceStage(ctx);
        const fetch = ModuleServerFetchDashboardConfig(ctx);

        return (params: TSendBody, options) => {
            return currentStage$.pipe(
                switchMap((stage) =>
                    fetch(
                        {
                            ...params,
                            target: stage.url,
                        },
                        options,
                    ),
                ),
            );
        };
    },
    {
        dedobs: {
            normalize: ([props]) => semanticHash.get(pick(props, 'id', 'digest'), {}),
            resetDelay: SHARE_RESET_DELAY,
            removeDelay: DEDUPE_REMOVE_DELAY,
        },
    },
);
