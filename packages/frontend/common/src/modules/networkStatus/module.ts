import { ModuleFactory } from '../../di';
import { networkStatus } from './index';

export const ModuleNetworkStatus = ModuleFactory(() => ({
    online$: networkStatus.online$,
}));
