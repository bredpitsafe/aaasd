import type { THerodotusTask } from '@frontend/herodotus/src/types/domain.ts';

import type { TRobotId } from '../../../types/domain/robots.ts';
import type { TSocketStruct, TSocketURL } from '../../../types/domain/sockets.ts';
import { createRemoteProcedureCall } from '../../../utils/RPC/createRemoteProcedureCall.ts';
import { createRemoteProcedureDescriptor } from '../../../utils/RPC/createRemoteProcedureDescriptor.ts';
import {
    EPlatformSocketRemoteProcedureName,
    ERemoteProcedureType,
} from '../../../utils/RPC/defs.ts';
import type { TSubscribed } from '../def.ts';
import { convertToSubscriptionEventValueDescriptor } from '../utils.ts';

type TParams = {
    filters: {
        robotId: TRobotId;
        // never used in the code
        // statuses?: Array<EHerodotusTaskStatus>;
    };
};
type TSendBody = {
    robotId: TRobotId;
};

type TUpdateBody = {
    type: 'HerodotusTaskUpdates';
    updates: Array<THerodotusTask>;
};

type TReceiveBody = TSubscribed | TUpdateBody;

const descriptor = createRemoteProcedureDescriptor<TSendBody, TReceiveBody>()(
    EPlatformSocketRemoteProcedureName.SubscribeToHerodotusTasks,
    ERemoteProcedureType.Subscribe,
);

export const ModuleSubscribeToHerodotusTasks = createRemoteProcedureCall(descriptor)({
    getParams: (params: { target: TSocketURL | TSocketStruct } & TParams) => {
        return {
            target: params.target,
            robotId: params.filters.robotId,
        };
    },
    getPipe: () => convertToSubscriptionEventValueDescriptor((payload) => payload.updates),
});
