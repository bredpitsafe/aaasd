import type { TInternalTransfer } from '../../../types/domain/balanceMonitor/defs';
import { ServerStreamResourceModuleFactory } from '../../../utils/ModuleFactories/ServerModuleFactory';
import type { TEmptySendBody } from './defs';

type TReceiveBody = TInternalTransfer & {
    type: 'InternalTransfer';
};

export const ModuleSubscribeToInternalTransferHistoryHandle = ServerStreamResourceModuleFactory<
    TEmptySendBody,
    TReceiveBody
>('SubscribeToInternalTransferHistory', { skipAuthentication: false })();
