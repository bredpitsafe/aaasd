import { DEDUPE_REMOVE_DELAY, SHARE_RESET_DELAY } from '@frontend/common/src/defs/observables';
import type { TUserName } from '@frontend/common/src/modules/user';
import { createObservableProcedure } from '@frontend/common/src/utils/LPC/createObservableProcedure.ts';
import { constantNormalizer } from '@frontend/common/src/utils/observable/memo.ts';
import { createRemoteProcedureCall } from '@frontend/common/src/utils/RPC/createRemoteProcedureCall.ts';
import { createRemoteProcedureDescriptor } from '@frontend/common/src/utils/RPC/createRemoteProcedureDescriptor.ts';
import {
    EPlatformSocketRemoteProcedureName,
    ERemoteProcedureType,
} from '@frontend/common/src/utils/RPC/defs';
import { mapValueDescriptor } from '@frontend/common/src/utils/Rx/ValueDescriptor2.ts';
import { semanticHash } from '@frontend/common/src/utils/semanticHash.ts';
import { shallowHash } from '@frontend/common/src/utils/shallowHash.ts';
import { createSyncedValueDescriptor } from '@frontend/common/src/utils/ValueDescriptor/utils.ts';
import { pick } from 'lodash-es';
import { pipe } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { convertDashboardStorageErrorToGrpcError } from '../../../actors/FullDashboards/actions/dashboardsStorage/utils.ts';
import { ModuleServiceStage } from '../../serviceStage';

type TSendBody = {};

type TReceiveBody = {
    type: 'UsersList';
    list: { user: TUserName }[];
};

const descriptor = createRemoteProcedureDescriptor<TSendBody, TReceiveBody>()(
    EPlatformSocketRemoteProcedureName.SubscribeToUsers,
    ERemoteProcedureType.Subscribe,
);

const ModuleServerSubscribeToUsers = createRemoteProcedureCall(descriptor)({
    getPipe: () => {
        return pipe(
            convertDashboardStorageErrorToGrpcError(),
            mapValueDescriptor(({ value }) => value.payload.list),
        );
    },
    dedobs: {
        normalize: ([params]) =>
            semanticHash.get(pick(params, 'target'), {
                target: semanticHash.withHasher(shallowHash),
            }),
        resetDelay: SHARE_RESET_DELAY,
        removeDelay: DEDUPE_REMOVE_DELAY,
    },
});

export const ModuleSubscribeToUsers = createObservableProcedure(
    (ctx) => {
        const { currentStage$ } = ModuleServiceStage(ctx);
        const subscribe = ModuleServerSubscribeToUsers(ctx);

        return (props: TSendBody, options) => {
            return currentStage$.pipe(
                switchMap((stage) =>
                    subscribe(
                        { ...props, target: stage.url },
                        { ...options, enableRetries: false },
                    ).pipe(
                        mapValueDescriptor(({ value }) =>
                            createSyncedValueDescriptor(value.map(({ user }) => user)),
                        ),
                    ),
                ),
            );
        };
    },
    {
        dedobs: {
            normalize: constantNormalizer,
            resetDelay: SHARE_RESET_DELAY,
            removeDelay: DEDUPE_REMOVE_DELAY,
        },
    },
);
