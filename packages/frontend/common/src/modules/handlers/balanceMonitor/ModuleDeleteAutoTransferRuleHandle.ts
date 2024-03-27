import type { TRuleId } from '../../../types/domain/balanceMonitor/defs';
import { ServerUpdateModuleFactory } from '../../../utils/ModuleFactories/ServerModuleFactory';

type TSendBody = {
    id: TRuleId;
};

type TReceiveBody = { type: 'AutoTransferRuleDeleted' };

export const ModuleDeleteAutoTransferRuleHandle = ServerUpdateModuleFactory<
    TSendBody,
    TReceiveBody
>('DeleteAutoTransferRule', { skipAuthentication: false })();
