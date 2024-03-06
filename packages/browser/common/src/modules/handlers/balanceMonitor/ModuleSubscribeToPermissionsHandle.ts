import type { EBalanceMonitorLayoutPermissions } from '../../../types/domain/balanceMonitor/defs';
import { ServerStreamResourceModuleFactory } from '../../../utils/ModuleFactories/ServerModuleFactory';
import type { TEmptySendBody } from './defs';

type TReceiveBody = {
    type: 'Permissions';
    availableTabs: EBalanceMonitorLayoutPermissions[];
};

export const ModuleSubscribeToPermissionsHandle = ServerStreamResourceModuleFactory<
    TEmptySendBody,
    TReceiveBody
>('SubscribeToPermissions', { skipAuthentication: false })();
