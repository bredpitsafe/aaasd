import type { TFullInfoByCoin } from '../../../types/domain/balanceMonitor/defs';
import { ServerStreamResourceModuleFactory } from '../../../utils/ModuleFactories/ServerModuleFactory';
import type { TEmptySendBody } from './defs';

type TReceiveBody = TFullInfoByCoin & {
    type: 'CoinInfo';
};

export const ModuleSubscribeToCoinInfoHandle = ServerStreamResourceModuleFactory<
    TEmptySendBody,
    TReceiveBody
>('SubscribeToCoinInfo', { skipAuthentication: false })();
