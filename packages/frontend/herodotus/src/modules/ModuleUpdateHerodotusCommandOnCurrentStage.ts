import { ModuleUpdateComponentCommandOnCurrentStage } from '@frontend/common/src/modules/actions/components/ModuleUpdateComponentCommandOnCurrentStage.ts';
import { EComponentCommands } from '@frontend/common/src/modules/actions/def.ts';
import { EComponentType } from '@frontend/common/src/types/domain/component';
import type { TRobotId } from '@frontend/common/src/types/domain/robots';
import { createObservableProcedure } from '@frontend/common/src/utils/LPC/createObservableProcedure.ts';

import type { THerodotusTaskId } from '../types/domain';
import { EHerodotusCommands } from '../types/domain';

type TCommandData =
    | {
          startTaskId: number;
      }
    | {
          stopTaskId: number;
      }
    | {
          deleteTaskId: number;
      }
    | {
          archiveTaskId: number;
      }
    | {
          cloneTask: number;
      };

function getHerodotusCommand(command: EHerodotusCommands, data: THerodotusTaskId): TCommandData {
    switch (command) {
        case EHerodotusCommands.start:
            return { startTaskId: data };
        case EHerodotusCommands.stop:
            return { stopTaskId: data };
        case EHerodotusCommands.delete:
            return { deleteTaskId: data };
        case EHerodotusCommands.archive:
            return { archiveTaskId: data };
        case EHerodotusCommands.clone:
            return { cloneTask: data };
    }
}

export const ModuleUpdateHerodotusCommandOnCurrentStage = createObservableProcedure((ctx) => {
    const update = ModuleUpdateComponentCommandOnCurrentStage(ctx);

    return (
        params: {
            robotId: TRobotId;
            taskId: THerodotusTaskId;
            command: EHerodotusCommands;
        },
        options,
    ) => {
        return update(
            {
                id: params.robotId,
                type: EComponentType.robot,
                command: EComponentCommands.GenericRobotCommand,
                commandData: getHerodotusCommand(params.command, params.taskId),
            },
            options,
        );
    };
});
