import { LoadingOverlay } from '@frontend/common/src/components/overlays/LoadingOverlay';
import { isNil } from 'lodash-es';

import { useCurrentRobot } from '../../../../hooks/useCurrentRobot';
import { WidgetPositions } from '../../Common/Positions';

export function WidgetRobotPositions() {
    const robot = useCurrentRobot();

    if (isNil(robot)) {
        return <LoadingOverlay />;
    }

    return <WidgetPositions robot={robot} />;
}
