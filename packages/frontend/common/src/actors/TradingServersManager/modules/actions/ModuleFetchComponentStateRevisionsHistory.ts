import type { ISO } from '@common/types';

import { EFetchHistoryDirection } from '../../../../modules/actions/def.ts';
import type { TComponentId } from '../../../../types/domain/component.ts';
import type { TComponentStateRevision } from '../../../../types/domain/ComponentStateRevision.ts';
import type { TWithSocketTarget } from '../../../../types/domain/sockets.ts';
import { createRemoteProcedureCall } from '../../../../utils/RPC/createRemoteProcedureCall.ts';
import { createRemoteProcedureDescriptor } from '../../../../utils/RPC/createRemoteProcedureDescriptor.ts';
import {
    EPlatformSocketRemoteProcedureName,
    ERemoteProcedureType,
} from '../../../../utils/RPC/defs.ts';
import { mapValueDescriptor } from '../../../../utils/Rx/ValueDescriptor2.ts';
import { createSyncedValueDescriptor } from '../../../../utils/ValueDescriptor/utils.ts';

const REVISIONS_LIMIT = 100;

type TSendBody = {
    componentId: TComponentId;
    btRunNo?: number;
    params: {
        platformTime: ISO;
        direction?: EFetchHistoryDirection;
        limit?: number;
    };
};

type TReceiveBody = {
    componentStates: TComponentStateRevision[];
};

const descriptor = createRemoteProcedureDescriptor<TSendBody, TReceiveBody>()(
    EPlatformSocketRemoteProcedureName.FetchComponentStateRevisionsHistory,
    ERemoteProcedureType.Request,
);

export const ModuleFetchComponentStateRevisionsHistory = createRemoteProcedureCall(descriptor)({
    getParams: (props: TWithSocketTarget & TSendBody) => {
        return {
            ...props,
            params: {
                ...props.params,
                limit: props.params.limit ?? REVISIONS_LIMIT,
                direction: props.params.direction ?? EFetchHistoryDirection.Backward,
            },
        };
    },
    getPipe: () =>
        mapValueDescriptor(({ value }) =>
            createSyncedValueDescriptor(value.payload.componentStates),
        ),
});
