import { ModuleFactory } from '../../di';
import { createModule } from './module.ts';

// Module for collecting currently active subscriptions & their latest state from RPC calls
export const ModuleSubscriptionsState = ModuleFactory(createModule);
