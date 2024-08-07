import type { Nil, ValueOf } from '@common/types';
import { useModule } from '@frontend/common/src/di/react';
import { ModuleRouter } from '@frontend/common/src/modules/router';
import type { TGate } from '@frontend/common/src/types/domain/gates';
import type { TRobot } from '@frontend/common/src/types/domain/robots';
import type { TServer } from '@frontend/common/src/types/domain/servers';
import { useSyncObservable } from '@frontend/common/src/utils/React/useSyncObservable';
import { toArrayIfNotNil } from '@frontend/common/src/utils/toArrayIfNotNil.ts';
import { isUndefined } from 'lodash-es';
import { useMemo } from 'react';

import { useGates } from '../../../hooks/gate.ts';
import { useRobots } from '../../../hooks/robot.ts';
import { useServer } from '../../../hooks/servers.ts';
import { useRouteParams } from '../../../hooks/useRouteParams';
import { ETradingServersManagerRoutes } from '../../../modules/router/defs';

export function useTitle() {
    const { state$ } = useModule(ModuleRouter);
    const routeParams = useRouteParams();
    const server = useServer(routeParams?.server);
    const gate = useGates(toArrayIfNotNil(routeParams?.gate));
    const robot = useRobots(toArrayIfNotNil(routeParams?.robot));
    const routeState = useSyncObservable(state$);
    const route = routeState?.route?.name as
        | undefined
        | ValueOf<typeof ETradingServersManagerRoutes>;

    return useMemo(
        () => getTitle(route, server.value, gate.value?.[0], robot.value?.[0]),
        [route, server, gate, robot],
    );
}

function getTitle(
    route?: ValueOf<typeof ETradingServersManagerRoutes>,
    server?: Nil | TServer,
    gate?: Nil | TGate,
    robot?: Nil | TRobot,
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
