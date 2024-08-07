import { Error } from '@frontend/common/src/components/Error/view';
import { LoadingOverlay } from '@frontend/common/src/components/overlays/LoadingOverlay';
import { Overlay } from '@frontend/common/src/components/overlays/Overlay';
import { useTimeZoneInfoSettings } from '@frontend/common/src/components/Settings/hooks/useTimeZoneSettings';
import { isLoadingValueDescriptor } from '@frontend/common/src/utils/ValueDescriptor/utils.ts';
import { useHerodotusRobots } from '@frontend/trading-servers-manager/src/hooks/robot.ts';
import { isNil } from 'lodash-es';
import type { ReactElement } from 'react';

import { RobotsListModal } from '../../RobotsList/modal';

export function ConnectedRobotSelector(): ReactElement {
    const robots = useHerodotusRobots();

    const [{ timeZone }] = useTimeZoneInfoSettings();

    if (isLoadingValueDescriptor(robots)) {
        return <LoadingOverlay text="Searching for robots..." />;
    }

    if (isNil(robots.value) || robots.value.length === 0) {
        return (
            <Error
                status="404"
                title="No robots found"
                subTitle="Use TSM to add robots or switch to another server"
            />
        );
    }

    return (
        <Overlay>
            <RobotsListModal robots={robots.value} timeZone={timeZone} />
        </Overlay>
    );
}
