import { Error } from '@frontend/common/src/components/Error/view';
import { LoadingOverlay } from '@frontend/common/src/components/overlays/LoadingOverlay';
import { useTimeZoneInfoSettings } from '@frontend/common/src/components/Settings/hooks/useTimeZoneSettings';
import { useModule } from '@frontend/common/src/di/react';
import { ModuleRobots } from '@frontend/common/src/modules/robots';
import { EApplicationName } from '@frontend/common/src/types/app';
import { useSyncObservable } from '@frontend/common/src/utils/React/useSyncObservable';
import { isNil } from 'lodash-es';
import { ReactElement, useMemo } from 'react';

import { RobotsListModal } from '../../RobotsList/modal';

export function ConnectedRobotSelector(): ReactElement {
    const { getHerodotusRobots$, loading$ } = useModule(ModuleRobots);
    const loading = useSyncObservable(loading$);
    const robots$ = useMemo(() => getHerodotusRobots$(), []);
    const robots = useSyncObservable(robots$);

    const [{ timeZone }] = useTimeZoneInfoSettings(EApplicationName.HerodotusTerminal);

    const loader = <LoadingOverlay text="Searching for robots..." />;

    if (loading) {
        return loader;
    }

    if (isNil(robots) || robots.length === 0) {
        return (
            <Error
                status="404"
                title="No robots found"
                subTitle="Use TSM to add robots or switch to another server"
            />
        );
    }

    return (
        <>
            <LoadingOverlay text="Searching for robots..." />;
            <RobotsListModal robots={robots} timeZone={timeZone} />
        </>
    );
}
