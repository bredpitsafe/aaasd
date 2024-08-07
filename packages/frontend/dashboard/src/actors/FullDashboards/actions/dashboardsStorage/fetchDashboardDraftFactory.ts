import { DEDUPE_REMOVE_DELAY, SHARE_RESET_DELAY } from '@frontend/common/src/defs/observables';
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
    type: 'DashboardDraft';
    draft: TStorageDashboardConfig;
};

const descriptor = createRemoteProcedureDescriptor<TSendBody, TReceiveBody>()(
    EPlatformSocketRemoteProcedureName.FetchDashboardDraft,
    ERemoteProcedureType.Request,
);
const ModuleServerFetchDashboardDraft = createRemoteProcedureCall(descriptor)({
    getParams: (params) => pick(params, 'target', 'id', 'digest'),
    getPipe: () =>
        pipe(
            convertDashboardStorageErrorToGrpcError(),
            mapValueDescriptor(({ value }) => value.payload.draft),
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

export const ModuleFetchDashboardDraft = createObservableProcedure(
    (ctx) => {
        const { currentStage$ } = ModuleServiceStage(ctx);
        const fetch = ModuleServerFetchDashboardDraft(ctx);
        return (params: TSendBody, options) => {
            return currentStage$.pipe(
                switchMap((stage) =>
                    fetch(
                        {
                            target: stage.url,
                            id: params.id,
                            digest: params.digest,
                        },
                        options,
                    ),
                ),
            );
        };
    },
    {
        dedobs: {
            normalize: ([params]) => semanticHash.get(pick(params, 'id', 'digest'), {}),
            resetDelay: SHARE_RESET_DELAY,
            removeDelay: DEDUPE_REMOVE_DELAY,
        },
    },
);
