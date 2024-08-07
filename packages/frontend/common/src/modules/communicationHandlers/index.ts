import type { TContextRef } from '../../di';
import { ModuleFactory } from '../../di';
import { createFetchHandlers } from './createFetchHandlers';

export function createModule(ctx: TContextRef) {
    return createFetchHandlers(ctx);
}

export const ModuleCommunicationHandlers = ModuleFactory(createModule);
