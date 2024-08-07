import type { TRobot } from '@frontend/common/src/types/domain/robots';
import type { TSocketStruct } from '@frontend/common/src/types/domain/sockets';
import type { ReactElement } from 'react';

import type { TCustomIndicatorsCommonProps } from '../../../CustomIndicators/CustomIndicators';
import { ETabName } from '../../../PageComponent/PageComponent';
import { TabCustomView } from '../../../Tabs/TabCustomView';

type TRobotCustomViewProps = TCustomIndicatorsCommonProps & {
    robot: TRobot;
    socket: TSocketStruct;
};

export function RobotCustomView(props: TRobotCustomViewProps): ReactElement {
    const { robot } = props;
    return <TabCustomView key={ETabName.customView + robot.id} {...props} />;
}
