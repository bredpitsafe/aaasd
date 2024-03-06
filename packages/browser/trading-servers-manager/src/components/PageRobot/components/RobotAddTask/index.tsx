import { Error } from '@frontend/common/src/components/Error/view';
import { LoadingOverlay } from '@frontend/common/src/components/overlays/LoadingOverlay';
import { isHerodotus } from '@frontend/common/src/utils/domain/isHerodotus';
import { THerodotusTaskFormData, WidgetHerodotusAddTaskForm } from '@frontend/herodotus';
import { ReactElement, useMemo } from 'react';

import { useCurrentRobot } from '../../../../hooks/useCurrentRobot';

type TConnectedRobotAddTaskProps = {
    data?: THerodotusTaskFormData;
};

export function ConnectedRobotAddTask(props: TConnectedRobotAddTaskProps): ReactElement {
    const robot = useCurrentRobot();
    const isHero = useMemo(() => isHerodotus(robot), [robot]);
    if (robot === undefined) {
        return <LoadingOverlay />;
    }

    if (!isHero) {
        return <Error status="warning" title="Robot doesn't support tasks" />;
    }

    return <WidgetHerodotusAddTaskForm robot={robot} task={props.data} />;
}
