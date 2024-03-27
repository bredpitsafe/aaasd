import { collectResponseTimeEnvBox } from '../../actors/Metrics/actions';
import { ModuleFactory, TContextRef } from '../../di';
import { ModuleActor } from '../actor';

function createModule(context: TContextRef) {
    const actor = ModuleActor(context);

    return {
        collectTimeToResponse: collectResponseTimeEnvBox.send.bind(null, actor),
    };
}

export type IModuleRemoteMetrics = ReturnType<typeof createModule>;

export const ModuleRemoteMetrics = ModuleFactory(createModule);
