import type { TContextRef } from '../../di';
import { ModuleFactory } from '../../di';
import { getRouterSocket$ } from './getRouterSocket$';

function createModule(ctx: TContextRef) {
    return {
        getRouterSocket$: getRouterSocket$(ctx),
    };
}

export const ModuleCommonObservables = ModuleFactory(createModule);
