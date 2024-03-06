import { ModuleFactory } from '../../di';
import { createModule } from './createModule';

export type IModuleSocketList = ReturnType<typeof createModule>;

export const ModuleSocketList = ModuleFactory(createModule);
