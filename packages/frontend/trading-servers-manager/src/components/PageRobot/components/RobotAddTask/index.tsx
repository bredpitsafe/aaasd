import { Error } from '@frontend/common/src/components/Error/view';
import { LoadingOverlay } from '@frontend/common/src/components/overlays/LoadingOverlay';
import { isHerodotus } from '@frontend/common/src/utils/domain/isHerodotus';
import {
    isLoadingValueDescriptor,
    isSyncedValueDescriptor,
} from '@frontend/common/src/utils/ValueDescriptor/utils.ts';
import type { THerodotusTaskFormData } from '@frontend/herodotus';
import { WidgetHerodotusAddTaskForm } from '@frontend/herodotus';
import type { ReactElement } from 'react';

import { useCurrentRobot } from '../../../../hooks/robot.ts';

type TConnectedRobotAddTaskProps = {
    data?: THerodotusTaskFormData;
};

export function ConnectedRobotAddTask(props: TConnectedRobotAddTaskProps): null | ReactElement {
    const robot = useCurrentRobot();

    switch (true) {
        case isLoadingValueDescriptor(robot):
            return <LoadingOverlay />;
        case isSyncedValueDescriptor(robot): {
            if (!isHerodotus(robot.value)) {
                return <Error status="warning" title="Robot doesn't support tasks" />;
            }

            return <WidgetHerodotusAddTaskForm robot={robot.value} task={props.data} />;
        }
        default:
            return null;
    }
}
