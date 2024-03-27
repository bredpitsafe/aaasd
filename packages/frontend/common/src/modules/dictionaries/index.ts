import { ModuleFactory, TContextRef } from '../../di';
import { getAssets$, getInstruments$ } from './observables';

export type IModuleDictionaries = ReturnType<typeof buildModule>;

function buildModule(ctx: TContextRef) {
    return {
        getAssets$: getAssets$.bind(undefined, ctx),
        getInstruments$: getInstruments$.bind(undefined, ctx),
    };
}

export const ModuleDictionaries = ModuleFactory(buildModule);
