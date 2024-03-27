import { ModuleFactory, TContextRef } from '../../di';
import { createFetchHandlers } from './createFetchHandlers';

export function createModule(ctx: TContextRef) {
    return createFetchHandlers(ctx);
}

export const ModuleCommunicationHandlers = ModuleFactory(createModule);
