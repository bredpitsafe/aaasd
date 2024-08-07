import { ModuleUpdateComponentCommandOnCurrentStage } from '@frontend/common/src/modules/actions/components/ModuleUpdateComponentCommandOnCurrentStage.ts';
import { EComponentCommands } from '@frontend/common/src/modules/actions/def.ts';
import { EComponentType } from '@frontend/common/src/types/domain/component.ts';
import type { TRobot } from '@frontend/common/src/types/domain/robots.ts';
import type { TStructurallyCloneableObject } from '@frontend/common/src/types/serialization.ts';
import { createObservableProcedure } from '@frontend/common/src/utils/LPC/createObservableProcedure.ts';

import type { THerodotusConfig } from '../types/domain.ts';
import { convertHerodotusTaskV1ToV2 } from '../utils/convertHerodotusTask.ts';
import { isV2HeroProtocolRobot } from '../utils/isV2HeroProtocol.ts';

export const ModuleAddHerodotusTask = createObservableProcedure((ctx) => {
    const update = ModuleUpdateComponentCommandOnCurrentStage(ctx);

    return (params: { robot: TRobot; taskConfig: THerodotusConfig }, options) => {
        let addTask: TStructurallyCloneableObject = params.taskConfig;
        // Decide on robot protocol depending on robot version, then prepare data accordingly
        if (isV2HeroProtocolRobot(params.robot)) {
            addTask = convertHerodotusTaskV1ToV2(params.taskConfig);
        }
        return update(
            {
                id: params.robot.id,
                type: EComponentType.robot,
                command: EComponentCommands.GenericRobotCommand,
                commandData: {
                    addTask,
                },
            },
            options,
        );
    };
});
