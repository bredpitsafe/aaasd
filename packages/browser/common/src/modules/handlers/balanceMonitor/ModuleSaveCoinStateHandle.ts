import type { TCoinId } from '../../../types/domain/balanceMonitor/defs';
import { ServerUpdateModuleFactory } from '../../../utils/ModuleFactories/ServerModuleFactory';

type TSendBody = {
    coin: TCoinId;
    comment: string;
};

type TReceiveBody = {
    type: 'CoinStateSaved';
};

export const ModuleSaveCoinStateHandle = ServerUpdateModuleFactory<TSendBody, TReceiveBody>(
    'SaveCoinState',
    { skipAuthentication: false },
)();
