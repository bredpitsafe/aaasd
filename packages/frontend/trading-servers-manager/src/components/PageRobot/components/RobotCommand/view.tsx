import { DisabledView } from '@frontend/common/src/components/Disabled';
import { TStructurallyCloneableObject } from '@frontend/common/src/types/serialization';
import { ReactElement } from 'react';

import { FormGenericCommand } from '../../../FormGenericCommand/view';
import { cnTab } from '../../../Tabs/styles.css';

type TRobotCommandProps = {
    disabled: boolean;
    onSendCommand: (value: TStructurallyCloneableObject) => void;
};

export function RobotCommand(props: TRobotCommandProps): ReactElement {
    const { disabled, onSendCommand } = props;

    return (
        <DisabledView className={cnTab} disabled={disabled}>
            <FormGenericCommand className={cnTab} onSend={onSendCommand} />
        </DisabledView>
    );
}
