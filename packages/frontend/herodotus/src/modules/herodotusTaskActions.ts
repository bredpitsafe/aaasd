import { ModuleFactory, TContextRef } from '@frontend/common/src/di';
import { sendGenericComponentCommandAction } from '@frontend/common/src/modules/actions/сomponentCommands';
import { EComponentType } from '@frontend/common/src/types/domain/component';
import { TRobot } from '@frontend/common/src/types/domain/robots';
import { TStructurallyCloneableObject } from '@frontend/common/src/types/serialization';
import { type Observable } from 'rxjs';

import { THerodotusTaskView } from '../types';
import { THerodotusConfig } from '../types/domain';
import { convertHerodotusTaskV1ToV2 } from '../utils/convertHerodotusTask';
import { isV2HeroProtocolRobot } from '../utils/isV2HeroProtocol';
import { createHerodotusTaskPatchV1 } from '../utils/taskPatch/v1';
import { createHerodotusTaskPatchV2 } from '../utils/taskPatch/v2';

function createModule(ctx: TContextRef) {
    const addHerodotusTask = (robot: TRobot, taskConfig: THerodotusConfig): Observable<unknown> => {
        let addTask: TStructurallyCloneableObject = taskConfig;
        // Decide on robot protocol depending on robot version, then prepare data accordingly
        if (isV2HeroProtocolRobot(robot)) {
            addTask = convertHerodotusTaskV1ToV2(taskConfig);
        }
        return sendGenericComponentCommandAction(ctx, EComponentType.robot, robot.id, {
            addTask,
        });
    };

    const updateHerodotusTask = (robot: TRobot, task: THerodotusTaskView): Observable<unknown> => {
        return sendGenericComponentCommandAction(ctx, EComponentType.robot, robot.id, {
            updateTask: isV2HeroProtocolRobot(robot)
                ? createHerodotusTaskPatchV2(task)
                : createHerodotusTaskPatchV1(task),
        });
    };

    return { addHerodotusTask, updateHerodotusTask };
}

export const ModuleHerodotusTaskActions = ModuleFactory(createModule);
