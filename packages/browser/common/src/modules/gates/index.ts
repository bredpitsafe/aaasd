import { ModuleFactory } from '../../di';
import {
    deleteGates,
    enableGatesRemoval,
    gates$,
    gatesRemovable$,
    getGate,
    getGate$,
    getGates,
    getGates$,
    upsertGates,
} from './data';

const module = {
    gates$,
    getGate$,
    getGates$,

    getGate,
    getGates,

    upsertGates,
    deleteGates,

    gatesRemovable$,
    enableGatesRemoval,
};

export type IModuleGates = typeof module;

export const ModuleGates = ModuleFactory(() => module);
