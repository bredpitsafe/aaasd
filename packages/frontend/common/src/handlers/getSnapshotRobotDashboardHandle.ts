import type { TRobotId } from '../types/domain/robots';
import type { ISO } from '../types/time';
import { createRemoteProcedureCall } from '../utils/RPC/createRemoteProcedureCall.ts';
import { createRemoteProcedureDescriptor } from '../utils/RPC/createRemoteProcedureDescriptor.ts';
import { EPlatformSocketRemoteProcedureName, ERemoteProcedureType } from '../utils/RPC/defs.ts';
import { mapValueDescriptor } from '../utils/Rx/ValueDescriptor2.ts';
import { createSyncedValueDescriptor } from '../utils/ValueDescriptor/utils.ts';
import type { TRobotDashboard } from './def';

type TSendBody = {
    robotId: TRobotId;
    platformTime: ISO;
    includeRaw: boolean;
    dashboardName: string;
};

type TReceiveBody = {
    dashboards?: (TServerRobotDashboard & { raw: string })[];
};

type TServerRobotDashboard = Omit<TRobotDashboard, 'id'>;

const descriptor = createRemoteProcedureDescriptor<TSendBody, TReceiveBody>()(
    EPlatformSocketRemoteProcedureName.ListRobotDashboards,
    ERemoteProcedureType.Request,
);

export const ModuleGetSnapshotRobotDashboard = createRemoteProcedureCall(descriptor)({
    getPipe: () => mapValueDescriptor(({ value }) => createSyncedValueDescriptor(value.payload)),
});
