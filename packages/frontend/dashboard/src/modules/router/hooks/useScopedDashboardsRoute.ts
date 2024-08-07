import { useModule } from '@frontend/common/src/di/react';
import { useSyncObservable } from '@frontend/common/src/utils/React/useSyncObservable';
import { useMemo } from 'react';

import { EDashboardRoutes } from '../../../types/router';
import { ModuleDashboardRouter } from '../module';

export const useScopedDashboardsState = () => {
    const { state$ } = useModule(ModuleDashboardRouter);

    const routeState = useSyncObservable(state$);
    const { isScopedDashboardsRoute, currentScope } = useMemo(
        () =>
            routeState &&
            (routeState.route.name == EDashboardRoutes.Dashboard ||
                routeState.route.name == EDashboardRoutes.Default) &&
            routeState.route.params.scope
                ? { isScopedDashboardsRoute: true, currentScope: routeState.route.params.scope }
                : { isScopedDashboardsRoute: false, currentScope: undefined },
        [routeState],
    );

    return { isScopedDashboardsRoute, currentScope };
};
