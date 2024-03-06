import { ModuleFactory } from '../../di';
import { dropState, getState$, setUserResizedState, upsertState } from './data';

const module = {
    getState$,
    upsertState,
    dropState,
    setUserResizedState,
};

export type IModuleTableStates = typeof module;

export const ModuleTableStates = ModuleFactory(() => module);
