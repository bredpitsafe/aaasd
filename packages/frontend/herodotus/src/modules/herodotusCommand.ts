import { ModuleFactory, TContextRef } from '@frontend/common/src/di';
import { EComponentCommands } from '@frontend/common/src/handlers/def';
import { sendGenericComponentCommandAction } from '@frontend/common/src/modules/actions/сomponentCommands';
import { EComponentType } from '@frontend/common/src/types/domain/component';
import { TRobotId } from '@frontend/common/src/types/domain/robots';
import type { Observable } from 'rxjs';

import { EHerodotusCommands, THerodotusTaskId } from '../types/domain';

type SendBody = {
    type: 'ExecCommand';
    id: TRobotId;
    command: EComponentCommands.GenericRobotCommand;
    commandData:
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
};

function getHerodotusCommand(
    command: EHerodotusCommands,
    data: THerodotusTaskId,
): SendBody['commandData'] {
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

function createModule(ctx: TContextRef) {
    const sendHerodotusCommand = (
        robotId: TRobotId,
        taskId: THerodotusTaskId,
        command: EHerodotusCommands,
    ): Observable<unknown> => {
        return sendGenericComponentCommandAction(
            ctx,
            EComponentType.robot,
            robotId,
            getHerodotusCommand(command, taskId),
        );
    };

    return { sendHerodotusCommand };
}

export const ModuleHerodotusCommand = ModuleFactory(createModule);
