import { ModuleFactory } from '@frontend/common/src/di';
import { ModuleRouter } from '@frontend/common/src/modules/router';
import type { IModuleRouter } from '@frontend/common/src/types/router';
import type { Route } from 'router5';

import { EDashboardRoutes, TDashboardRouterData } from '../../types/router';
import {
    decodeDashboardParams,
    decodeIndicatorDashboardParams,
    decodeRobotDashboardParams,
    encodeDashboardParams,
    encodeIndicatorDashboardParams,
    encodeRobotDashboardParams,
} from './encoders';

const DashboardRoutes = [
    {
        name: EDashboardRoutes.Dashboard,
        path: '/dashboard?:storageId&:serverId&:position&:backtestingId',
        encodeParams: encodeDashboardParams,
        decodeParams: decodeDashboardParams,
    },
    {
        name: EDashboardRoutes.ReadonlyRobotDashboard,
        path: `/${EDashboardRoutes.ReadonlyRobotDashboard}?:socket&:robotId&:dashboard&:focusTo&:position&:snapshotDate&:dashboardBacktestingId&:backtestingId`,
        encodeParams: encodeRobotDashboardParams,
        decodeParams: decodeRobotDashboardParams,
    },
    {
        name: EDashboardRoutes.ReadonlyIndicatorsDashboard,
        path: `/${EDashboardRoutes.ReadonlyIndicatorsDashboard}?:socket&:indicators&:focusTo&:position&:backtestingId`,
        encodeParams: encodeIndicatorDashboardParams,
        decodeParams: decodeIndicatorDashboardParams,
    },
    { name: EDashboardRoutes.Default, path: '/' },
] as Route[];

export const ModuleDashboardRouter = ModuleFactory((ctx) => {
    const module = ModuleRouter(ctx);

    module.router.add(DashboardRoutes);
    module.router.setOption('defaultRoute', EDashboardRoutes.Default);

    return module as IModuleRouter<TDashboardRouterData>;
});
