import type { TRobotId } from '@frontend/common/src/types/domain/robots.ts';
import { createRemoteProcedureCall } from '@frontend/common/src/utils/RPC/createRemoteProcedureCall.ts';
import { createRemoteProcedureDescriptor } from '@frontend/common/src/utils/RPC/createRemoteProcedureDescriptor.ts';
import {
    EPlatformSocketRemoteProcedureName,
    ERemoteProcedureType,
} from '@frontend/common/src/utils/RPC/defs.ts';
import { mapValueDescriptor } from '@frontend/common/src/utils/Rx/ValueDescriptor2.ts';
import { createSyncedValueDescriptor } from '@frontend/common/src/utils/ValueDescriptor/utils.ts';
import type { THerodotusTaskId, THerodotusTrade } from '@frontend/herodotus/src/types/domain.ts';

type TSendBody = {
    taskId: THerodotusTaskId;
    robotId: TRobotId;
};

type TReceivedBody = {
    trades: THerodotusTrade[];
};
const descriptor = createRemoteProcedureDescriptor<TSendBody, TReceivedBody>()(
    EPlatformSocketRemoteProcedureName.ListHerodotusTrades,
    ERemoteProcedureType.Request,
);

export const ModuleGetListHerodotusTrades = createRemoteProcedureCall(descriptor)({
    getPipe: () =>
        mapValueDescriptor(({ value }) => createSyncedValueDescriptor(value.payload.trades)),
});
