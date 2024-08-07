import type { ValueOf } from '@common/types';
import { useModule } from '@frontend/common/src/di/react';
import type { TLayoutId } from '@frontend/common/src/modules/layouts/data';
import { LAYOUT_ID_LEVEL_SEPARATOR } from '@frontend/common/src/modules/layouts/data';
import { ModuleRouter } from '@frontend/common/src/modules/router';
import { isHerodotus } from '@frontend/common/src/utils/domain/isHerodotus';
import { useSyncObservable } from '@frontend/common/src/utils/React/useSyncObservable';

import { ELayoutIds } from '../layouts';
import type { TTradingServersManagerParams } from '../modules/router/defs';
import { ETradingServersManagerRoutes } from '../modules/router/defs';
import { useRobot } from './robot.ts';
import { useRouteParams } from './useRouteParams';

export function useLayoutId(): TLayoutId | undefined {
    const { state$ } = useModule(ModuleRouter);
    const routeState = useSyncObservable(state$);
    const route = routeState?.route?.name as
        | undefined
        | ValueOf<typeof ETradingServersManagerRoutes>;
    const routeParams = useRouteParams();
    const robot = useRobot(routeParams?.robot);

    return getLayoutId(route, routeParams, isHerodotus(robot.value), robot.value?.kind);
}

function getLayoutId(
    route: ValueOf<typeof ETradingServersManagerRoutes> | undefined,
    routeParams: TTradingServersManagerParams | undefined,
    isHero: boolean | undefined,
    robotKind: string | undefined,
): TLayoutId | undefined {
    if (
        route === ETradingServersManagerRoutes.Server ||
        route === ETradingServersManagerRoutes.Stage
    ) {
        return ELayoutIds.PageServers;
    }
    if (route === ETradingServersManagerRoutes.Gate && routeParams?.gate !== undefined) {
        return ELayoutIds.PageGates;
    }
    if (route === ETradingServersManagerRoutes.Robot && routeParams?.robot !== undefined) {
        return isHero
            ? ELayoutIds.PageHerodotus
            : robotKind
              ? `${ELayoutIds.PageRobots}${LAYOUT_ID_LEVEL_SEPARATOR}${robotKind}`
              : ELayoutIds.PageRobots;
    }
}
