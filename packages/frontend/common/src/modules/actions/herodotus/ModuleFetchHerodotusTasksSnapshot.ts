import type { EHerodotusTaskStatus, THerodotusTask } from '@frontend/herodotus/src/types/domain.ts';

import type { TRobotId } from '../../../types/domain/robots.ts';
import type { TSocketURL } from '../../../types/domain/sockets.ts';
import { createRemoteProcedureCall } from '../../../utils/RPC/createRemoteProcedureCall.ts';
import { createRemoteProcedureDescriptor } from '../../../utils/RPC/createRemoteProcedureDescriptor.ts';
import {
    EPlatformSocketRemoteProcedureName,
    ERemoteProcedureType,
} from '../../../utils/RPC/defs.ts';
import { mapValueDescriptor } from '../../../utils/Rx/ValueDescriptor2.ts';
import { createSyncedValueDescriptor } from '../../../utils/ValueDescriptor/utils.ts';

const DEFAULT_LIMIT = 100;

type TSendBody = {
    params: {
        limit: number;
        offset: number;
    };
    filters: {
        robotId: TRobotId;
        statuses?: Array<EHerodotusTaskStatus>;
    };
};

type TReceiveBody = {
    entities: Array<THerodotusTask>;
};

type TParams = {
    filters: {
        robotId: TRobotId;
        statuses?: Array<EHerodotusTaskStatus>;
    };
    limit?: number;
};

const descriptor = createRemoteProcedureDescriptor<TSendBody, TReceiveBody>()(
    EPlatformSocketRemoteProcedureName.FetchHerodotusTasksSnapshot,
    ERemoteProcedureType.Request,
);

export const ModuleFetchHerodotusTasksSnapshot = createRemoteProcedureCall(descriptor)({
    getParams: (params: { target: TSocketURL } & TParams) => {
        return {
            target: params.target,
            params: {
                limit: params.limit ?? DEFAULT_LIMIT,
                offset: 0,
            },
            filters: params.filters,
        };
    },
    getPipe: () =>
        mapValueDescriptor(({ value }) => createSyncedValueDescriptor(value.payload.entities)),
});
