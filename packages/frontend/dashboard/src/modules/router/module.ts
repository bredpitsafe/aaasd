import { ModuleFactory } from '@frontend/common/src/di';
import { ModuleRouter } from '@frontend/common/src/modules/router';
import { TYPICAL_GET_PARAMS } from '@frontend/common/src/modules/router/defs.ts';
import type { IModuleRouter } from '@frontend/common/src/types/router';
import type { Route } from 'router5';

import type { TDashboardRouterData } from '../../types/router';
import { EDashboardRoutes } from '../../types/router';
import {
    decodeDashboardParams,
    decodeDefaultRouteParams,
    decodeIndicatorDashboardParams,
    decodeRobotDashboardParams,
    encodeDashboardParams,
    encodeDefaultRouteParams,
    encodeIndicatorDashboardParams,
    encodeRobotDashboardParams,
} from './encoders';

const DashboardRoutes = [
    {
        name: EDashboardRoutes.Dashboard,
        path: `/dashboard?:storageId&:serverId&:scope&:position&:backtestingId${TYPICAL_GET_PARAMS}`,
        encodeParams: encodeDashboardParams,
        decodeParams: decodeDashboardParams,
    },
    {
        name: EDashboardRoutes.ReadonlyRobotDashboard,
        path: `/${EDashboardRoutes.ReadonlyRobotDashboard}?:socket&:robotId&:dashboard&:focusTo&:position&:snapshotDate&:dashboardBacktestingId&:backtestingId${TYPICAL_GET_PARAMS}`,
        encodeParams: encodeRobotDashboardParams,
        decodeParams: decodeRobotDashboardParams,
    },
    {
        name: EDashboardRoutes.ReadonlyIndicatorsDashboard,
        path: `/${EDashboardRoutes.ReadonlyIndicatorsDashboard}?:socket&:indicators&:focusTo&:position&:backtestingId${TYPICAL_GET_PARAMS}`,
        encodeParams: encodeIndicatorDashboardParams,
        decodeParams: decodeIndicatorDashboardParams,
    },
    {
        name: EDashboardRoutes.Default,
        path: '/?:scope',
        encodeParams: encodeDefaultRouteParams,
        decodeParams: decodeDefaultRouteParams,
    },
] as Route[];

export const ModuleDashboardRouter = ModuleFactory((ctx) => {
    const module = ModuleRouter(ctx);

    module.router.add(DashboardRoutes);
    module.router.setOption('defaultRoute', EDashboardRoutes.Default);

    return module as IModuleRouter<TDashboardRouterData>;
});
