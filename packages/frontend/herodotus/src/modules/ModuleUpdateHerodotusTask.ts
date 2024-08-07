import { ModuleUpdateComponentCommandOnCurrentStage } from '@frontend/common/src/modules/actions/components/ModuleUpdateComponentCommandOnCurrentStage.ts';
import { EComponentCommands } from '@frontend/common/src/modules/actions/def.ts';
import { EComponentType } from '@frontend/common/src/types/domain/component.ts';
import type { TRobot } from '@frontend/common/src/types/domain/robots.ts';
import { createObservableProcedure } from '@frontend/common/src/utils/LPC/createObservableProcedure.ts';

import type { THerodotusTaskView } from '../types';
import { isV2HeroProtocolRobot } from '../utils/isV2HeroProtocol.ts';
import { createHerodotusTaskPatchV1 } from '../utils/taskPatch/v1.ts';
import { createHerodotusTaskPatchV2 } from '../utils/taskPatch/v2.ts';

export const ModuleUpdateHerodotusTask = createObservableProcedure((ctx) => {
    const update = ModuleUpdateComponentCommandOnCurrentStage(ctx);

    return (params: { robot: TRobot; task: THerodotusTaskView }, options) => {
        return update(
            {
                id: params.robot.id,
                type: EComponentType.robot,
                command: EComponentCommands.GenericRobotCommand,
                commandData: {
                    updateTask: isV2HeroProtocolRobot(params.robot)
                        ? createHerodotusTaskPatchV2(params.task)
                        : createHerodotusTaskPatchV1(params.task),
                },
            },
            options,
        );
    };
});
