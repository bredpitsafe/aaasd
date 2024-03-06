import type { TRobotId } from '../types/domain/robots';
import { ServerResourceModuleFactory } from '../utils/ModuleFactories/ServerModuleFactory';
import type { TRobotDashboard } from './def';

type TSendBody = {
    btRunNo?: number;
    robotId: TRobotId;
    dashboardName: string;
};

type TReceivedBody = TRobotDashboard & {
    raw: string;
};

export const ModuleGetRobotDashboardResource = ServerResourceModuleFactory<
    TSendBody,
    TReceivedBody
>('GetRobotDashboard')();
