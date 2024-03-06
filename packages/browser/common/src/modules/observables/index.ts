import { ModuleFactory, TContextRef } from '../../di';
import { createDashboardsListSubscriptionFactory } from './createDashboardsListSubscriptionFactory';
import { createDashboardSubscriptionFactory } from './createDashboardSubscriptionFactory';
import { getRouterSocket$ } from './getRouterSocket$';
import { getRouterSocketName$ } from './getRouterSocketName$';

function createModule(ctx: TContextRef) {
    return {
        createDashboardsListSubscription: createDashboardsListSubscriptionFactory(ctx),
        createDashboardSubscription: createDashboardSubscriptionFactory(ctx),
        getRouterSocket$: getRouterSocket$(ctx),
        getRouterSocketName$: getRouterSocketName$(ctx),
    };
}

export type IModuleCommonObservables = ReturnType<typeof createModule>;
export const ModuleCommonObservables = ModuleFactory(createModule);
