import { ModuleFactory } from '../../di';
import { boxFilters, deleteFilter, initFilterDatabase, setFilter } from './data';

const module = {
    filters$: boxFilters.obs,
    initFilterDatabase,
    setFilter,
    deleteFilter,
};

export type IModuleClientTableFilters = typeof module;

export const ModuleClientTableFilters = ModuleFactory(() => module);
