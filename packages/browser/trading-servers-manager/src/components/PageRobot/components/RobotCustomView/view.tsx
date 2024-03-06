import { TRobot } from '@frontend/common/src/types/domain/robots';
import { TSocketName } from '@frontend/common/src/types/domain/sockets';
import { ReactElement } from 'react';

import { TCustomIndicatorsProps } from '../../../CustomIndicators/CustomIndicators';
import { ETabName } from '../../../PageComponent/PageComponent';
import { TabCustomView } from '../../../Tabs/TabCustomView';

type TRobotCustomViewProps = TCustomIndicatorsProps & {
    robot: TRobot;
    socketName: TSocketName;
};

export function RobotCustomView(props: TRobotCustomViewProps): ReactElement {
    const { robot } = props;
    return <TabCustomView key={ETabName.customView + robot.id} {...props} />;
}
