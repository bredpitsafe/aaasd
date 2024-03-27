import type { TRuleId } from '../../../types/domain/balanceMonitor/defs';
import { ServerUpdateModuleFactory } from '../../../utils/ModuleFactories/ServerModuleFactory';

type TSendBody = {
    id: TRuleId;
};

type TReceiveBody = { type: 'TransferRuleDeleted' };

export const ModuleDeleteTransferRuleHandle = ServerUpdateModuleFactory<TSendBody, TReceiveBody>(
    'DeleteTransferRule',
    { skipAuthentication: false },
)();
