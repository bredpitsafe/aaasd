import { ConnectedFrame } from '@frontend/common/src/components/Frame/ConnectedFrame';
import { LoadingOverlay } from '@frontend/common/src/components/overlays/LoadingOverlay';
import { useModule } from '@frontend/common/src/di/react';
import { ModuleSocketPage } from '@frontend/common/src/modules/socketPage';
import type { TScope } from '@frontend/common/src/types/domain/dashboardsStorage.ts';
import { useSyncObservable } from '@frontend/common/src/utils/React/useSyncObservable';
import { getScopedDashboardsURL } from '@frontend/common/src/utils/urlBuilders';
import { isNil } from 'lodash-es';
import { useMemo } from 'react';

import { useRouteParams } from '../../hooks/useRouteParams';

export function ConnectedBoundDashboards() {
    const { currentSocketName$ } = useModule(ModuleSocketPage);
    const stage = useSyncObservable(currentSocketName$);
    const routeParams = useRouteParams();

    const scope: TScope | undefined = useMemo(() => {
        const componentId = routeParams?.gate ?? routeParams?.robot;

        if (isNil(componentId) || isNil(stage)) {
            return;
        }

        return {
            componentId: String(componentId),
            stage,
        };
    }, [routeParams?.gate, routeParams?.robot, stage]);

    if (!routeParams) {
        return <LoadingOverlay text="Loading..." />;
    }

    return <ConnectedFrame id="Bound Dashboards" url={getScopedDashboardsURL(scope)} />;
}
