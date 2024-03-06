import type { TRobot } from '@frontend/common/src/types/domain/robots';
import type { TimeZone } from '@frontend/common/src/types/time';
import { WidgetTableHerodotusTasks } from '@frontend/herodotus';
import type { ReactElement } from 'react';

import { EDefaultLayoutComponents } from '../../../../layouts/default';
import type { TConnectedRobotTasksProps } from './index';
import { cnTable } from './view.css';

type TRobotTasksProps = Pick<TConnectedRobotTasksProps, 'tableId'> & {
    robot: TRobot;
    timeZone: TimeZone;
};

export function RobotTasks({ tableId, robot, timeZone }: TRobotTasksProps): ReactElement {
    return (
        <WidgetTableHerodotusTasks
            tableId={tableId}
            className={cnTable}
            robot={robot}
            timeZone={timeZone}
            indicatorsDashboardTabId={EDefaultLayoutComponents.IndicatorsDashboard}
        />
    );
}
