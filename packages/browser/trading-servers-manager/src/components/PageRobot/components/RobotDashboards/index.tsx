import { LoadingOverlay } from '@frontend/common/src/components/overlays/LoadingOverlay';
import { ReactElement } from 'react';

import { useCurrentRobot } from '../../../../hooks/useCurrentRobot';
import { ConnectedTableDashboards } from './ConnectedTableDashboards';

export function ConnectedRobotDashboards(): ReactElement {
    const robot = useCurrentRobot();

    if (robot === undefined) {
        return <LoadingOverlay />;
    }

    return <ConnectedTableDashboards robot={robot} />;
}
