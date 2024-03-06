import { ModuleFactory } from '../../di';
import { ModuleGetRobotDashboardResource } from '../../handlers/getRobotDashboardHandle';
import { SocketStreamError } from '../../lib/SocketStream/SocketStreamError';
import { ServerActionModuleFactory } from '../../utils/ModuleFactories/ServerModuleFactory';

export const ModuleGetRobotDashboard = ModuleFactory((ctx) => {
    const getRobotDashboard = ServerActionModuleFactory(ModuleGetRobotDashboardResource)(
        (url, params) => ({
            loading: () => 'Loading robot dashboard...',
            success: () => 'Robot dashboard loaded',
            error: (err: Error | SocketStreamError) => ({
                message: `Error loading robot[${params.robotId}] dashboard[${params.dashboardName}]`,
                description: err.message,
            }),
        }),
    )(ctx);

    return { getRobotDashboard };
});
