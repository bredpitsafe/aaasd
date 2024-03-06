import type { TAmount, TCoinId, TExchangeId } from '../../../types/domain/balanceMonitor/defs';
import { ServerUpdateModuleFactory } from '../../../utils/ModuleFactories/ServerModuleFactory';

type TSendBody = {
    exchange: TExchangeId;
    coin: TCoinId;
    amount: TAmount;
};

type TReceiveBody = {
    type: 'Success';
};

export const ModuleStartGatheringHandle = ServerUpdateModuleFactory<TSendBody, TReceiveBody>(
    'StartGathering',
    { skipAuthentication: false },
)();
