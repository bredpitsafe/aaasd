import { ModuleFactory } from '../../di';
import { createModule } from './module';

export type IModuleSocketServerTime = ReturnType<typeof createModule>;

export const ModuleSocketServerTime = ModuleFactory(createModule);
