import type { TCoinId, TCoinRateDelta } from '../../../types/domain/balanceMonitor/defs';
import { ServerStreamResourceModuleFactory } from '../../../utils/ModuleFactories/ServerModuleFactory';
import type { TEmptySendBody } from './defs';

type TReceiveBody = {
    type: 'PumpDump';
    coin: TCoinId;
    deltas: TCoinRateDelta[];
};

export const ModuleSubscribeToPumpDumpInfoHandle = ServerStreamResourceModuleFactory<
    TEmptySendBody,
    TReceiveBody
>('SubscribeToPumpDumpInfo', { skipAuthentication: false })();
