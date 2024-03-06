import { ModuleFactory, TContextRef } from '../../di';
import { createFetchHandlersRemoted } from './createFetchHandlers';

export function createModule(ctx: TContextRef) {
    return createFetchHandlersRemoted(ctx);
}

export type IModuleCommunicationHandlersRemoted = Awaited<ReturnType<typeof createModule>>;

export const ModuleCommunicationHandlersRemoted = ModuleFactory(createModule);
