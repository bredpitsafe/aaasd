import type { TCoinConvertRate } from '../../../types/domain/balanceMonitor/defs';
import { ServerStreamResourceModuleFactory } from '../../../utils/ModuleFactories/ServerModuleFactory';
import type { TEmptySendBody } from './defs';

type TReceiveBody = TCoinConvertRate & {
    type: 'ConvertRate';
};

export const ModuleSubscribeToConvertRatesHandle = ServerStreamResourceModuleFactory<
    TEmptySendBody,
    TReceiveBody
>('SubscribeToConvertRates', { skipAuthentication: false })();
