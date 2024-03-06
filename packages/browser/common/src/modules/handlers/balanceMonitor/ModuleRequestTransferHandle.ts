import type { TTransferAction } from '../../../types/domain/balanceMonitor/defs';
import { ServerUpdateModuleFactory } from '../../../utils/ModuleFactories/ServerModuleFactory';

type TSendBody = TTransferAction;

type TReceiveBody = {
    type: 'Transferred';
};

export const ModuleRequestTransferHandle = ServerUpdateModuleFactory<TSendBody, TReceiveBody>(
    'RequestTransfer',
    { skipAuthentication: false },
)();
