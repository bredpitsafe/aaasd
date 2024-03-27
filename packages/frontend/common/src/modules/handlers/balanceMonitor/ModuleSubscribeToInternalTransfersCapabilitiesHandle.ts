import type { TInternalTransfersInfo } from '../../../types/domain/balanceMonitor/defs';
import { ServerStreamResourceModuleFactory } from '../../../utils/ModuleFactories/ServerModuleFactory';
import type { TEmptySendBody } from './defs';

type TReceiveBody = TInternalTransfersInfo & {
    type: 'InternalTransfersInfo';
};

export const ModuleSubscribeToInternalTransfersCapabilitiesHandle =
    ServerStreamResourceModuleFactory<TEmptySendBody, TReceiveBody>(
        'SubscribeToInternalTransfersCapabilities',
        { skipAuthentication: false },
    )();
