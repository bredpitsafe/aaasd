import type { TimeZone } from '@common/types';
import { Modal } from '@frontend/common/src/components/Modals';
import type { TRobot } from '@frontend/common/src/types/domain/robots';
import { isNil } from 'lodash-es';

import { RobotsList } from './index';

type TRobotsListModalProps = {
    robots?: TRobot[];
    timeZone: TimeZone;
};
export function RobotsListModal(props: TRobotsListModalProps) {
    if (isNil(props.robots) || props.robots.length < 2) {
        return null;
    }

    return (
        <Modal title="Select Robot" visible closable={false} footer={null}>
            <RobotsList robots={props.robots} timeZone={props.timeZone} />
        </Modal>
    );
}
