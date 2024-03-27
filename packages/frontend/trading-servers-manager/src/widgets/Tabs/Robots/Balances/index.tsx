import { LoadingOverlay } from '@frontend/common/src/components/overlays/LoadingOverlay';
import { isNil } from 'lodash-es';

import { useCurrentRobot } from '../../../../hooks/useCurrentRobot';
import { WidgetBalances } from '../../Common/Balances';

export function WidgetRobotBalances() {
    const robot = useCurrentRobot();

    if (isNil(robot)) {
        return <LoadingOverlay />;
    }

    return <WidgetBalances robot={robot} />;
}
