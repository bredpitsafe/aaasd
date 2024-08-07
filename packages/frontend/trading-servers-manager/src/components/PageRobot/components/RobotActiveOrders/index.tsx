import { Error } from '@frontend/common/src/components/Error/view.tsx';
import { LoadingOverlay } from '@frontend/common/src/components/overlays/LoadingOverlay';
import {
    isLoadingValueDescriptor,
    isSyncedValueDescriptor,
} from '@frontend/common/src/utils/ValueDescriptor/utils.ts';
import { isNil } from 'lodash-es';
import type { ReactElement } from 'react';

import { useCurrentRobot } from '../../../../hooks/robot.ts';
import { ConnectedTableActiveOrders } from '../ConnectedTableActiveOrders/ConnectedTableActiveOrders';

export function ConnectedRobotActiveOrders(): ReactElement {
    const robot = useCurrentRobot();

    switch (true) {
        case isLoadingValueDescriptor(robot):
            return <LoadingOverlay />;
        case isSyncedValueDescriptor(robot):
            return isNil(robot.value) ? (
                <Error status={404} />
            ) : (
                <ConnectedTableActiveOrders robot={robot.value} />
            );
    }
    if (robot === undefined) {
        return <LoadingOverlay />;
    }

    return <ConnectedTableActiveOrders robot={robot.value} />;
}
