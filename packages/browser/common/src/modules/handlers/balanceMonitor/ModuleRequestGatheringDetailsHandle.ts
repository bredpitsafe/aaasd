import type { TExchangeId } from '../../../types/domain/balanceMonitor/defs';
import { ServerResourceModuleFactory } from '../../../utils/ModuleFactories/ServerModuleFactory';
import type { TEmptySendBody } from './defs';

type TReceiveBody = {
    type: 'TransferDetails';
    exchanges: TExchangeId[];
};

export const ModuleRequestGatheringDetailsHandle = ServerResourceModuleFactory<
    TEmptySendBody,
    TReceiveBody
>('RequestGatheringDetails', { skipAuthentication: false })();
