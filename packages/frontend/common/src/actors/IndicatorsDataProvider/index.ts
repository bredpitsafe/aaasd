import type { TContextRef } from '../../di';
import { createActor } from '../../utils/Actors';
import { ModuleRegisterActorRemoteProcedure } from '../../utils/RPC/registerRemoteProcedure';
import { EActorName } from '../Root/defs';
import { ModuleSubscribeToIndicatorsFiniteSnapshot } from './actions/ModuleSubscribeToIndicatorsFiniteSnapshot.ts';
import { subscribeToIndicatorsFiniteSnapshotProcedureDescriptor } from './descriptors.ts';
import { initIndicatorsEffects } from './effects/indicators.ts';

export function createIndicatorsDataProvider() {
    return createActor(EActorName.IndicatorsDataProvider, async (context) => {
        const ctx = context as unknown as TContextRef;
        const registerActorRemoteProcedure = ModuleRegisterActorRemoteProcedure(ctx);
        const subscribeToIndicatorsFiniteSnapshot = ModuleSubscribeToIndicatorsFiniteSnapshot(ctx);

        registerActorRemoteProcedure(
            subscribeToIndicatorsFiniteSnapshotProcedureDescriptor,
            (params, options) => {
                return subscribeToIndicatorsFiniteSnapshot(params, options);
            },
        );

        initIndicatorsEffects(ctx);
    });
}
