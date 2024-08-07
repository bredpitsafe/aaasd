import { Error } from '@frontend/common/src/components/Error/view.tsx';
import { LoadingOverlay } from '@frontend/common/src/components/overlays/LoadingOverlay';
import {
    isLoadingValueDescriptor,
    isSyncedValueDescriptor,
} from '@frontend/common/src/utils/ValueDescriptor/utils.ts';
import { isNil } from 'lodash-es';

import { useCurrentRobot } from '../../../../hooks/robot.ts';
import { WidgetPositions } from '../../Common/Positions';

export function WidgetRobotPositions() {
    const robot = useCurrentRobot();

    switch (true) {
        case isLoadingValueDescriptor(robot):
            return <LoadingOverlay />;
        case isSyncedValueDescriptor(robot):
            return isNil(robot.value) ? (
                <Error status={404} />
            ) : (
                <WidgetPositions robot={robot.value} />
            );
        default:
            return null;
    }
}
