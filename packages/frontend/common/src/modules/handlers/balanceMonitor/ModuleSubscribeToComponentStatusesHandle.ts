import type { TComponentStatusInfo } from '../../../types/domain/balanceMonitor/defs';
import { ServerStreamResourceModuleFactory } from '../../../utils/ModuleFactories/ServerModuleFactory';
import type { TEmptySendBody } from './defs';

type TReceiveBody = {
    type: 'ComponentStatuses';
    components: TComponentStatusInfo[];
};

export const ModuleSubscribeToComponentStatusesHandle = ServerStreamResourceModuleFactory<
    TEmptySendBody,
    TReceiveBody
>('SubscribeToComponentStatuses', { skipAuthentication: false })();
