import { DEDUPE_REMOVE_DELAY, SHARE_RESET_DELAY } from '@frontend/common/src/defs/observables';
import type { TRequestStreamOptions } from '@frontend/common/src/handlers/def';
import type { TStorageDashboardListItem } from '@frontend/common/src/types/domain/dashboardsStorage';
import { createObservableProcedure } from '@frontend/common/src/utils/LPC/createObservableProcedure';
import { createRemoteProcedureCall } from '@frontend/common/src/utils/RPC/createRemoteProcedureCall';
import { createRemoteProcedureDescriptor } from '@frontend/common/src/utils/RPC/createRemoteProcedureDescriptor';
import {
    EPlatformSocketRemoteProcedureName,
    ERemoteProcedureType,
} from '@frontend/common/src/utils/RPC/defs';
import { mapValueDescriptor } from '@frontend/common/src/utils/Rx/ValueDescriptor2.ts';
import { semanticHash } from '@frontend/common/src/utils/semanticHash.ts';
import { shallowHash } from '@frontend/common/src/utils/shallowHash';
import { TValueDescriptor2 } from '@frontend/common/src/utils/ValueDescriptor/types';
import { createSyncedValueDescriptor } from '@frontend/common/src/utils/ValueDescriptor/utils.ts';
import { pipe } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { ModuleServiceStage } from '../../../../modules/serviceStage';
import { convertDashboardStorageErrorToGrpcError } from './utils.ts';

type TSendBody = TRequestStreamOptions;

type TReceiveBody = {
    type: 'DashboardsList';
    list: TStorageDashboardListItem[];
};

const descriptor = createRemoteProcedureDescriptor<TSendBody, TReceiveBody>()(
    EPlatformSocketRemoteProcedureName.SubscribeToDashboardsList,
    ERemoteProcedureType.Subscribe,
);

const ModuleServerSubscribeToDashboardList = createRemoteProcedureCall(descriptor)({
    getParams: (props) => {
        return {
            target: props.target,
        };
    },
    getPipe: () => {
        return pipe(
            convertDashboardStorageErrorToGrpcError(),
            mapValueDescriptor(({ value: envelope }) =>
                createSyncedValueDescriptor(envelope.payload.list),
            ),
        );
    },
    dedobs: {
        normalize: ([props]) =>
            semanticHash.get(props, {
                target: semanticHash.withHasher(shallowHash),
            }),
        resetDelay: SHARE_RESET_DELAY,
        removeDelay: DEDUPE_REMOVE_DELAY,
    },
});

export const ModuleSubscribeToDashboardsList = createObservableProcedure<
    TSendBody,
    TValueDescriptor2<TStorageDashboardListItem[]>
>(
    (ctx) => {
        const { currentStage$ } = ModuleServiceStage(ctx);
        const subscribe = ModuleServerSubscribeToDashboardList(ctx);

        return (params, options) => {
            return currentStage$.pipe(
                switchMap((stage) => subscribe({ ...params, target: stage.url }, options)),
            );
        };
    },
    {
        dedobs: {
            normalize: ([props]) => semanticHash.get(props, {}),
            resetDelay: SHARE_RESET_DELAY,
            removeDelay: DEDUPE_REMOVE_DELAY,
        },
    },
);
