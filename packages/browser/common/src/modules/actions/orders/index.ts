import { ModuleFactory, TContextRef } from '../../../di';
import { getOrders } from './getOrders';
import { subscribeToOrders } from './subscribeToOrders';

function createModule(ctx: TContextRef) {
    return {
        getOrders: getOrders.bind(null, ctx),
        subscribeToOrders: subscribeToOrders.bind(null, ctx),
    };
}

export const ModuleOrders = ModuleFactory(createModule);
