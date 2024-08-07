import { toContextRef } from '../../di';
import { createActor } from '../../utils/Actors';
import { ModuleRegisterActorRemoteProcedure } from '../../utils/RPC/registerRemoteProcedure.ts';
import { EActorName } from '../Root/defs';
import {
    fetchComponentStateProcedureDescriptor,
    FetchComponentStateRevisionProcedureDescriptor,
    fetchGateKindsProcedureDescriptor,
    SubscribeToComponentStateRevisionsSnapshotProcedureDescriptor,
} from './descriptors.ts';
import { initOrdersEffects } from './effects/orders';
import { ModuleFetchComponentState } from './modules/actions/ModuleFetchComponentState.ts';
import { ModuleFetchComponentStateRevision } from './modules/actions/ModuleFetchComponentStateRevision.ts';
import { ModuleFetchGateKinds } from './modules/actions/ModuleFetchGateKinds.ts';
import { ModuleSubscribeToComponentStateRevisionsSnapshot } from './modules/actions/ModuleSubscribeToComponentStateRevisionsSnapshot.ts';

export function createTradingServersManagerDataProvider() {
    return createActor(EActorName.TradingServersManagerDataProvider, (context) => {
        const ctx = toContextRef(context);
        const register = ModuleRegisterActorRemoteProcedure(ctx);

        register(
            FetchComponentStateRevisionProcedureDescriptor,
            ModuleFetchComponentStateRevision(ctx),
        );

        register(
            SubscribeToComponentStateRevisionsSnapshotProcedureDescriptor,
            ModuleSubscribeToComponentStateRevisionsSnapshot(ctx),
        );

        register(fetchComponentStateProcedureDescriptor, ModuleFetchComponentState(ctx));

        register(fetchGateKindsProcedureDescriptor, ModuleFetchGateKinds(ctx));

        initOrdersEffects(ctx);
    });
}
