import type { ISO } from '@common/types';

import type { TRobotId } from '../../../types/domain/robots.ts';
import { EMPTY_ARRAY } from '../../../utils/const.ts';
import { createRemoteProcedureCall } from '../../../utils/RPC/createRemoteProcedureCall.ts';
import { createRemoteProcedureDescriptor } from '../../../utils/RPC/createRemoteProcedureDescriptor.ts';
import {
    EPlatformSocketRemoteProcedureName,
    ERemoteProcedureType,
} from '../../../utils/RPC/defs.ts';
import { mapValueDescriptor } from '../../../utils/Rx/ValueDescriptor2.ts';
import { shallowHash } from '../../../utils/shallowHash.ts';
import { createSyncedValueDescriptor } from '../../../utils/ValueDescriptor/utils.ts';
import type { TRobotDashboard } from '../def.ts';

type TSendBody = {
    robotId: TRobotId;
    platformTime: ISO;
    includeRaw?: boolean;
    dashboardName?: string;
    btRunNo?: number;
};

type TReceiveBody = {
    dashboards?: TServerRobotDashboard[];
};

type TServerRobotDashboard = Omit<TRobotDashboard, 'id'>;

const descriptor = createRemoteProcedureDescriptor<TSendBody, TReceiveBody>()(
    EPlatformSocketRemoteProcedureName.ListRobotDashboards,
    ERemoteProcedureType.Request,
);

export const ModuleListRobotDashboards = createRemoteProcedureCall(descriptor)({
    getPipe: (params) =>
        mapValueDescriptor(({ value }) => {
            const mapped =
                value.payload.dashboards?.map((dashboard) => ({
                    ...dashboard,
                    id: shallowHash(dashboard.robotId, dashboard.name),
                    backtestingId: params.btRunNo,
                })) ?? (EMPTY_ARRAY as TRobotDashboard[]);

            return createSyncedValueDescriptor(mapped);
        }),
});
