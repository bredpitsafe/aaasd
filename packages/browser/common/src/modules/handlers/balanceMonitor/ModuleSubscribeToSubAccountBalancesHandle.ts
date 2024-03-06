import type { TSubAccountBalance } from '../../../types/domain/balanceMonitor/defs';
import { ServerStreamResourceModuleFactory } from '../../../utils/ModuleFactories/ServerModuleFactory';
import type { TEmptySendBody } from './defs';

type TReceiveBody = TSubAccountBalance & {
    type: 'SubAccountBalance';
};

export const ModuleSubscribeToSubAccountBalancesHandle = ServerStreamResourceModuleFactory<
    TEmptySendBody,
    TReceiveBody
>('SubscribeToSubAccountBalances', { skipAuthentication: false })();
