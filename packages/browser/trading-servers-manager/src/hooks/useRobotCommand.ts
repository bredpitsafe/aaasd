import { useModule } from '@frontend/common/src/di/react';
import { ModuleBaseActions } from '@frontend/common/src/modules/actions';
import { EComponentType } from '@frontend/common/src/types/domain/component';
import { TRobot } from '@frontend/common/src/types/domain/robots';
import { TStructurallyCloneableObject } from '@frontend/common/src/types/serialization';
import { componentIsAllowed } from '@frontend/common/src/utils/domain/components';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { useState } from 'react';
import { firstValueFrom } from 'rxjs';

type TUseRobotCommandReturnType = {
    disabled: boolean;
    sendCommand: (value: TStructurallyCloneableObject) => void;
};

export function useRobotCommand(robot?: TRobot): TUseRobotCommandReturnType | undefined {
    const { sendGenericComponentCommandAction } = useModule(ModuleBaseActions);

    const [disabled, setDisabled] = useState(false);
    const sendCommand = useFunction((value: TStructurallyCloneableObject) => {
        if (robot === undefined) {
            return;
        }

        setDisabled(true);
        firstValueFrom(sendGenericComponentCommandAction(EComponentType.robot, robot.id, value))
            .then(() => setDisabled(false))
            .catch(() => setDisabled(false));
    });

    return robot && componentIsAllowed(robot.status)
        ? {
              disabled,
              sendCommand,
          }
        : undefined;
}
