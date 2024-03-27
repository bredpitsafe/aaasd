import type { TTransferHistoryItem } from '../../../types/domain/balanceMonitor/defs';
import { ServerStreamResourceModuleFactory } from '../../../utils/ModuleFactories/ServerModuleFactory';
import type { TEmptySendBody } from './defs';

type TReceiveBody = TTransferHistoryItem & {
    type: 'Transfer';
};

export const ModuleSubscribeToTransferHistoryHandle = ServerStreamResourceModuleFactory<
    TEmptySendBody,
    TReceiveBody
>('SubscribeToTransferHistory', { skipAuthentication: false })();
