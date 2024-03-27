import type { TRuleId } from '../../../types/domain/balanceMonitor/defs';
import { ServerUpdateModuleFactory } from '../../../utils/ModuleFactories/ServerModuleFactory';

type TSendBody = {
    id: TRuleId;
};

type TReceiveBody = { type: 'LimitingTransferRuleDeleted' };

export const ModuleDeleteLimitingTransferRuleHandle = ServerUpdateModuleFactory<
    TSendBody,
    TReceiveBody
>('DeleteLimitingTransferRule', { skipAuthentication: false })();
