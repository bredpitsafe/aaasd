import { useModule } from '@frontend/common/src/di/react';
import { ModuleGates } from '@frontend/common/src/modules/gates';
import { ModuleRobots } from '@frontend/common/src/modules/robots';
import { ModuleRouter } from '@frontend/common/src/modules/router';
import { ModuleServers } from '@frontend/common/src/modules/servers';
import { TGate } from '@frontend/common/src/types/domain/gates';
import { TRobot } from '@frontend/common/src/types/domain/robots';
import { TServer } from '@frontend/common/src/types/domain/servers';
import { useSyncObservable } from '@frontend/common/src/utils/React/useSyncObservable';
import { isUndefined } from 'lodash-es';
import { useMemo } from 'react';
import { ValueOf } from 'webactor';

import { useRouteParams } from '../../../hooks/useRouteParams';
import { ETradingServersManagerRoutes } from '../../../modules/router/defs';

export function useTitle() {
    const { state$ } = useModule(ModuleRouter);
    const { getServer$ } = useModule(ModuleServers);
    const { getGate$ } = useModule(ModuleGates);
    const { getRobot$ } = useModule(ModuleRobots);
    const routeState = useSyncObservable(state$);
    const route = routeState?.route?.name as
        | undefined
        | ValueOf<typeof ETradingServersManagerRoutes>;
    const routeParams = useRouteParams();
    const server = useSyncObservable(getServer$(routeParams?.server));
    const gate = useSyncObservable(getGate$(routeParams?.gate));
    const robot = useSyncObservable(getRobot$(routeParams?.robot));

    return useMemo(() => getTitle(route, server, gate, robot), [route, server, gate, robot]);
}

function getTitle(
    route?: ValueOf<typeof ETradingServersManagerRoutes>,
    server?: TServer | void,
    gate?: TGate | void,
    robot?: TRobot | void,
): string {
    const hasServer = !isUndefined(server);
    let title = '...';

    if (hasServer) {
        title = server ? `> ${server.id}` : '...';
    }

    if (hasServer && route === ETradingServersManagerRoutes.Gate) {
        title += ' > ' + (gate ? `${gate.name} (id: ${gate.id})` : '...');
    }

    if (hasServer && route === ETradingServersManagerRoutes.Robot) {
        title += ' > ' + (robot ? `${robot.name} (id: ${robot.id})` : '...');
    }

    return title;
}
