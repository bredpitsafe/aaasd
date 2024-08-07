import { ModuleFactory } from '../../di';
import { createModule } from './module.ts';

export const ModuleMock = ModuleFactory(createModule);
