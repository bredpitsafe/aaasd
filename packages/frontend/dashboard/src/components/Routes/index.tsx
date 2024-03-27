import { createTestProps } from '@frontend/common/e2e';
import { EDashboardPageSelectors } from '@frontend/common/e2e/selectors/dashboard/dashboard.page.selectors';
import { LoadingOverlay } from '@frontend/common/src/components/overlays/LoadingOverlay';
import { useModule } from '@frontend/common/src/di/react';
import { assertNever } from '@frontend/common/src/utils/assert';
import { useSyncObservable } from '@frontend/common/src/utils/React/useSyncObservable';
import { useMemo } from 'react';

import { ModuleDashboardRouter } from '../../modules/router/module';
import { EDashboardRoutes } from '../../types/router';
import { ConnectedLayout } from '../Layout';

export const Routes = () => {
    const { state$ } = useModule(ModuleDashboardRouter);

    const routeState = useSyncObservable(state$);

    const comp = useMemo(() => {
        if (routeState === undefined) {
            return <LoadingOverlay text="Loading router..." />;
        }

        const {
            route: { name },
        } = routeState;

        switch (name) {
            case EDashboardRoutes.Dashboard:
            case EDashboardRoutes.ReadonlyRobotDashboard:
            case EDashboardRoutes.ReadonlyIndicatorsDashboard:
            case EDashboardRoutes.Default:
                return <ConnectedLayout />;
            default:
                assertNever(name);
        }
    }, [routeState]);

    return (
        <div
            style={{ width: '100%', height: '100%' }}
            {...createTestProps(EDashboardPageSelectors.App)}
        >
            {comp}
        </div>
    );
};
