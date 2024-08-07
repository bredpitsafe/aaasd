import type { Nil } from '@common/types';
import { generateTraceId } from '@common/utils';
import { assert } from '@common/utils/src/assert.ts';
import { useModule } from '@frontend/common/src/di/react';
import { ModuleUpdateComponentCommandOnCurrentStage } from '@frontend/common/src/modules/actions/components/ModuleUpdateComponentCommandOnCurrentStage.ts';
import { EComponentCommands } from '@frontend/common/src/modules/actions/def.ts';
import { EComponentType } from '@frontend/common/src/types/domain/component';
import type { TRobot } from '@frontend/common/src/types/domain/robots';
import type { TStructurallyCloneableObject } from '@frontend/common/src/types/serialization';
import { componentIsAllowed } from '@frontend/common/src/utils/domain/components';
import { useNotifiedObservableFunction } from '@frontend/common/src/utils/React/useObservableFunction.ts';
import { isLoadingValueDescriptor } from '@frontend/common/src/utils/ValueDescriptor/utils.ts';
import { isNil } from 'lodash-es';

type TUseRobotCommandReturnType = {
    disabled: boolean;
    sendCommand: (value: TStructurallyCloneableObject) => void;
};

export function useRobotCommand(robot?: Nil | TRobot): TUseRobotCommandReturnType | undefined {
    const updateComponentCommand = useModule(ModuleUpdateComponentCommandOnCurrentStage);

    const [sendCommand, sendState] = useNotifiedObservableFunction(
        (value: TStructurallyCloneableObject) => {
            assert(!isNil(robot), 'Robot is not defined');
            return updateComponentCommand(
                {
                    id: robot.id,
                    type: EComponentType.robot,
                    command: EComponentCommands.GenericRobotCommand,
                    commandData: value,
                },
                { traceId: generateTraceId() },
            );
        },
    );

    return !isNil(robot) && componentIsAllowed(robot.status)
        ? {
              disabled: isLoadingValueDescriptor(sendState),
              sendCommand,
          }
        : undefined;
}
