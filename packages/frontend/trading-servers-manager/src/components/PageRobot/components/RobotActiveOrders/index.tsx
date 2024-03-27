import { LoadingOverlay } from '@frontend/common/src/components/overlays/LoadingOverlay';
import { ReactElement } from 'react';

import { useCurrentRobot } from '../../../../hooks/useCurrentRobot';
import { ConnectedTableActiveOrders } from '../ConnectedTableActiveOrders/ConnectedTableActiveOrders';

export function ConnectedRobotActiveOrders(): ReactElement {
    const robot = useCurrentRobot();

    if (robot === undefined) {
        return <LoadingOverlay />;
    }

    return <ConnectedTableActiveOrders robot={robot} />;
}
