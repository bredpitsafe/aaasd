import type { TCoinId, TExchangeId } from '../../../types/domain/balanceMonitor/defs';
import { ServerUpdateModuleFactory } from '../../../utils/ModuleFactories/ServerModuleFactory';

type TSendBody = {
    exchange: TExchangeId;
    coin: TCoinId;
};

type TReceiveBody = {
    type: 'Success';
};

export const ModuleStopGatheringHandle = ServerUpdateModuleFactory<TSendBody, TReceiveBody>(
    'StopGathering',
    { skipAuthentication: false },
)();
