import { Error } from '@frontend/common/src/components/Error/view.tsx';
import { LoadingOverlay } from '@frontend/common/src/components/overlays/LoadingOverlay';
import {
    isLoadingValueDescriptor,
    isSyncedValueDescriptor,
} from '@frontend/common/src/utils/ValueDescriptor/utils.ts';
import { isNil } from 'lodash-es';
import type { ReactElement } from 'react';

import { useCurrentRobot } from '../../../../hooks/robot.ts';
import { ConnectedTableDashboards } from './ConnectedTableDashboards';

export function ConnectedRobotDashboards(): null | ReactElement {
    const robot = useCurrentRobot();

    switch (true) {
        case isLoadingValueDescriptor(robot):
            return <LoadingOverlay />;
        case isSyncedValueDescriptor(robot): {
            if (isNil(robot.value)) {
                return <Error status={404} />;
            } else {
                return <ConnectedTableDashboards robot={robot.value} />;
            }
        }
        default:
            return null;
    }
}
