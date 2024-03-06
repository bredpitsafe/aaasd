import { isNil } from 'lodash-es';
import { map } from 'rxjs/operators';

import { ModuleGetSnapshotRobotDashboardResource } from '../../handlers/getSnapshotRobotDashboardHandle';
import { ServerActionModuleFactory } from '../../utils/ModuleFactories/ServerModuleFactory';

export const ModuleGetSnapshotRobotDashboardAction = ServerActionModuleFactory(
    ModuleGetSnapshotRobotDashboardResource,
)(() => ({
    extendPipe: (resource$) => {
        return resource$.pipe(
            map(({ dashboards }) => {
                if (isNil(dashboards) || dashboards.length === 0) {
                    return undefined;
                }

                return dashboards[0].raw;
            }),
        );
    },
}));
