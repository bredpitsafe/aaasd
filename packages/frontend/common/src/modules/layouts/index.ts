import { ModuleFactory } from '../../di';
import { createModule } from './data';

export enum ECommonComponents {
    AddTask = 'Add Task',
    Frame = 'Frame',
}

export const ModuleLayouts = ModuleFactory(createModule);
