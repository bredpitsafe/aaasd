import { useModule } from '@frontend/common/src/di/react';
import { LAYOUT_ID_LEVEL_SEPARATOR, TLayoutId } from '@frontend/common/src/modules/layouts/data';
import { ModuleRobots } from '@frontend/common/src/modules/robots';
import { ModuleRouter } from '@frontend/common/src/modules/router';
import { isHerodotus } from '@frontend/common/src/utils/domain/isHerodotus';
import { useSyncObservable } from '@frontend/common/src/utils/React/useSyncObservable';
import { useMemo } from 'react';
import { ValueOf } from 'webactor';

import { ELayoutIds } from '../layouts';
import { ETradingServersManagerRoutes, TTradingServersManagerParams } from '../modules/router/defs';
import { useRouteParams } from './useRouteParams';

export function useLayoutId(): TLayoutId | undefined {
    const { state$ } = useModule(ModuleRouter);
    const { getRobot$ } = useModule(ModuleRobots);
    const routeState = useSyncObservable(state$);
    const route = routeState?.route?.name as
        | undefined
        | ValueOf<typeof ETradingServersManagerRoutes>;
    const routeParams = useRouteParams();

    const robot = useSyncObservable(getRobot$(routeParams?.robot));
    const isHero = useMemo(() => isHerodotus(robot), [robot]);

    return useMemo(
        () => getLayoutId(route, routeParams, isHero, robot?.kind),
        [route, routeParams, isHero, robot?.kind],
    );
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
