import { ModuleFactory } from '../../di';
import { isAuthenticatedSocket$, setAuthenticationSocketState } from './data';

const module = {
    setAuthenticationSocketState,
    isAuthenticatedSocket$,
};

export type IModuleAuthentication = typeof module;

export const ModuleAuthentication = ModuleFactory(() => module);
