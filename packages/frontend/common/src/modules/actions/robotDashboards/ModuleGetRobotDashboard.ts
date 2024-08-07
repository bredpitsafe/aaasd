import type { TRobotId } from '../../../types/domain/robots.ts';
import { createRemoteProcedureCall } from '../../../utils/RPC/createRemoteProcedureCall.ts';
import { createRemoteProcedureDescriptor } from '../../../utils/RPC/createRemoteProcedureDescriptor.ts';
import {
    EPlatformSocketRemoteProcedureName,
    ERemoteProcedureType,
} from '../../../utils/RPC/defs.ts';
import { mapValueDescriptor } from '../../../utils/Rx/ValueDescriptor2.ts';
import { createSyncedValueDescriptor } from '../../../utils/ValueDescriptor/utils.ts';
import type { TRobotDashboard } from '../def.ts';

type TSendBody = {
    btRunNo?: number;
    robotId: TRobotId;
    dashboardName: string;
};

type TReceivedBody = TRobotDashboard & {
    raw: string;
};

const descriptor = createRemoteProcedureDescriptor<TSendBody, TReceivedBody>()(
    EPlatformSocketRemoteProcedureName.GetRobotDashboard,
    ERemoteProcedureType.Request,
);

export const ModuleGetRobotDashboard = createRemoteProcedureCall(descriptor)({
    getPipe: () =>
        mapValueDescriptor(({ value }) => {
            return createSyncedValueDescriptor(value.payload);
        }),
});
