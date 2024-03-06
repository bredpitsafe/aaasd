import { useModule } from '@frontend/common/src/di/react';
import { ModuleRobots } from '@frontend/common/src/modules/robots';
import { TRobot } from '@frontend/common/src/types/domain/robots';
import { useObservable } from 'react-use';

import { useRouteParams } from './useRouteParams';

export function useCurrentRobot(): TRobot | undefined {
    const { getRobot$ } = useModule(ModuleRobots);
    const robotId = useCurrentRobotId();
    return useObservable(getRobot$(robotId));
}

export function useCurrentRobotId(): TRobot['id'] | undefined {
    const params = useRouteParams();
    return params?.robot;
}
