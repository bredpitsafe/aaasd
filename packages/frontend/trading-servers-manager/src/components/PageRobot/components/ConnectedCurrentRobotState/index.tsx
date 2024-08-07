import { LoadingOverlay } from '@frontend/common/src/components/overlays/LoadingOverlay';
import { isUndefined } from 'lodash-es';

import { useCurrentRobotId } from '../../../../hooks/robot.ts';
import { ConnectedComponentStateRevisions } from '../../../ConnectedComponentStateRevisions';

export function ConnectedCurrentRobotState() {
    const robotId = useCurrentRobotId();

    if (isUndefined(robotId)) {
        return <LoadingOverlay />;
    }

    return <ConnectedComponentStateRevisions componentId={robotId} />;
}
