import { Error } from '@frontend/common/src/components/Error/view.tsx';
import { LoadingOverlay } from '@frontend/common/src/components/overlays/LoadingOverlay';
import { useModule } from '@frontend/common/src/di/react';
import { ModuleSocketPage } from '@frontend/common/src/modules/socketPage';
import { EComponentType } from '@frontend/common/src/types/domain/component';
import type { TRobot } from '@frontend/common/src/types/domain/robots';
import type { TSocketStruct } from '@frontend/common/src/types/domain/sockets';
import { useSyncObservable } from '@frontend/common/src/utils/React/useSyncObservable.ts';
import {
    isLoadingValueDescriptor,
    isSyncedValueDescriptor,
} from '@frontend/common/src/utils/ValueDescriptor/utils.ts';
import { isNil } from 'lodash-es';
import type { ReactElement } from 'react';

import { useCurrentRobot } from '../../../../hooks/robot.ts';
import { useDraftedComponentConfig } from '../../../../hooks/useDraftedComponentConfig';
import { usePageComponentMetadata } from '../../../../hooks/usePageComponentMetadata';
import { RobotCustomView } from './view';

export function ConnectedRobotCustomView(): null | ReactElement {
    const { currentSocketStruct$ } = useModule(ModuleSocketPage);
    const socket = useSyncObservable(currentSocketStruct$);
    const robot = useCurrentRobot();

    switch (true) {
        case isNil(socket):
        case isLoadingValueDescriptor(robot):
            return <LoadingOverlay />;
        case isSyncedValueDescriptor(robot):
            return isNil(robot.value) ? (
                <Error status={404} />
            ) : (
                <InnerConnectedRobotCustomView robot={robot.value} socket={socket} />
            );
        default:
            return null;
    }
}

function InnerConnectedRobotCustomView(props: {
    robot: TRobot;
    socket: TSocketStruct;
}): ReactElement {
    const { robot, socket } = props;
    const draftedComponentConfig = useDraftedComponentConfig(EComponentType.robot, robot);
    const { setCustomViewDraft, getCustomViewScrollPosition, setCustomViewScrollPosition } =
        usePageComponentMetadata(EComponentType.robot, robot.id);

    return (
        <RobotCustomView
            robot={robot}
            socket={socket}
            draft={draftedComponentConfig.draft}
            setDraft={setCustomViewDraft}
            getScrollPosition={getCustomViewScrollPosition}
            onSetScrollPosition={setCustomViewScrollPosition}
        />
    );
}
