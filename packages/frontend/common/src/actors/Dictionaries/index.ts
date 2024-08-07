import { toContextRef } from '../../di';
import { createActor } from '../../utils/Actors';
import { ModuleRegisterActorRemoteProcedure } from '../../utils/RPC/registerRemoteProcedure.ts';
import { EActorName } from '../Root/defs';
import { ModuleFetchAssets } from './actions/ModuleFetchAssets.ts';
import { ModuleFetchInstruments } from './actions/ModuleFetchInstruments.ts';
import {
    fetchAssetsProcedureDescriptors,
    fetchInstrumentsProcedureDescriptors,
} from './descriptors.ts';

export function createActorDictionaries() {
    return createActor(EActorName.Dictionaries, (context) => {
        const ctx = toContextRef(context);
        const register = ModuleRegisterActorRemoteProcedure(ctx);
        register(fetchAssetsProcedureDescriptors, ModuleFetchAssets(ctx));
        register(fetchInstrumentsProcedureDescriptors, ModuleFetchInstruments(ctx));
    });
}
