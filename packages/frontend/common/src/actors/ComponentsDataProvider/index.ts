import type { TContextRef } from '../../di';
import { createActor } from '../../utils/Actors';
import { ModuleRegisterActorRemoteProcedure } from '../../utils/RPC/registerRemoteProcedure';
import { EActorName } from '../Root/defs';
import { ModuleSubscribeToComponentsSnapshot } from './actions/ModuleSubscribeToComponentsSnapshot.ts';
import { subscribeToComponentsSnapshotProcedureDescriptor } from './descriptors';

export function createActorComponentsDataProvider() {
    return createActor(EActorName.ComponentsDataProvider, async (context) => {
        const ctx = context as unknown as TContextRef;
        const registerActorRemoteProcedure = ModuleRegisterActorRemoteProcedure(ctx);
        const subscribeToComponentsSnapshot = ModuleSubscribeToComponentsSnapshot(ctx);
        registerActorRemoteProcedure(
            subscribeToComponentsSnapshotProcedureDescriptor,
            subscribeToComponentsSnapshot,
        );
    });
}
