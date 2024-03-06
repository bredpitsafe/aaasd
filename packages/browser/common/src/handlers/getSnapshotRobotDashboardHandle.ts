import type { TRobotId } from '../types/domain/robots';
import type { ISO } from '../types/time';
import { ServerResourceModuleFactory } from '../utils/ModuleFactories/ServerModuleFactory';
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

export const ModuleGetSnapshotRobotDashboardResource = ServerResourceModuleFactory<
    TSendBody,
    TReceiveBody
>('ListRobotDashboards')();
