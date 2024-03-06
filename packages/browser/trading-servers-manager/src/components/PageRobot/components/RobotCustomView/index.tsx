import { LoadingOverlay } from '@frontend/common/src/components/overlays/LoadingOverlay';
import { useModule } from '@frontend/common/src/di/react';
import { ModuleCommunication } from '@frontend/common/src/modules/communication';
import { EComponentType } from '@frontend/common/src/types/domain/component';
import { TRobot } from '@frontend/common/src/types/domain/robots';
import { TSocketName, TSocketURL } from '@frontend/common/src/types/domain/sockets';
import { ReactElement } from 'react';
import { useObservable } from 'react-use';

import { useCurrentRobot } from '../../../../hooks/useCurrentRobot';
import { useDraftedComponentConfig } from '../../../../hooks/useDraftedComponentConfig';
import { usePageComponentMetadata } from '../../../../hooks/usePageComponentMetadata';
import { RobotCustomView } from './view';

export function ConnectedRobotCustomView(): ReactElement {
    const { currentSocketUrl$, currentSocketName$ } = useModule(ModuleCommunication);
    const socketUrl = useObservable(currentSocketUrl$);
    const socketName = useObservable(currentSocketName$);
    const robot = useCurrentRobot();

    if (robot === undefined || socketUrl === undefined || socketName === undefined) {
        return <LoadingOverlay />;
    }

    return (
        <InnerConnectedRobotCustomView
            robot={robot}
            socketName={socketName}
            socketUrl={socketUrl}
        />
    );
}

function InnerConnectedRobotCustomView(props: {
    robot: TRobot;
    socketUrl: TSocketURL;
    socketName: TSocketName;
}): ReactElement {
    const { robot, socketUrl, socketName } = props;
    const draftedComponentConfig = useDraftedComponentConfig(EComponentType.robot, robot);
    const { setCustomViewDraft, getCustomViewScrollPosition, setCustomViewScrollPosition } =
        usePageComponentMetadata(EComponentType.robot, robot.id);

    return (
        <RobotCustomView
            robot={robot}
            socketUrl={socketUrl}
            socketName={socketName}
            draft={draftedComponentConfig.draft}
            setDraft={setCustomViewDraft}
            getScrollPosition={getCustomViewScrollPosition}
            onSetScrollPosition={setCustomViewScrollPosition}
        />
    );
}
