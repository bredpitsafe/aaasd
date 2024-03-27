import { ModuleFactory, TContextRef } from '../../di';
import { saveLogs } from './actions';

export function createModule(ctx: TContextRef) {
    return {
        saveLogs: saveLogs.bind(null, ctx),
    };
}

export type IModuleLogger = ReturnType<typeof createModule>;

export const ModuleLogger = ModuleFactory(createModule);
