import type { TInternalTransferAction } from '../../../types/domain/balanceMonitor/defs';
import { ServerUpdateModuleFactory } from '../../../utils/ModuleFactories/ServerModuleFactory';

type TSendBody = TInternalTransferAction;

type TReceiveBody = {
    type: 'InternalTransferred';
};

export const ModuleRequestInternalTransferHandle = ServerUpdateModuleFactory<
    TSendBody,
    TReceiveBody
>('RequestInternalTransfer', { skipAuthentication: false })();
