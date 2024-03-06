import {
    ERuleGroups,
    TRuleId,
    TTransferBlockingRuleCreate,
    TTransferBlockingRuleUpdate,
} from '../../../types/domain/balanceMonitor/defs';
import type { ISO } from '../../../types/time';
import { ServerUpdateModuleFactory } from '../../../utils/ModuleFactories/ServerModuleFactory';
import type { TCoinSelectorRaw, TRuleVertexRaw } from './defs';
import { convertToServerRuleCoin, convertToServerRuleVertex } from './utils';

type TSendBody = {
    id?: TRuleId;
    coin: TCoinSelectorRaw;
    source: TRuleVertexRaw;
    destination: TRuleVertexRaw;
    note?: string;
    withOpposite: boolean;
    showAlert: boolean;
    disableManual: boolean;
    disableSuggest: boolean;
    since?: ISO;
    until?: ISO;
};

type TReceiveBody = { type: 'TransferRuleApplied' };

export const ModuleSetTransferRuleHandle = ServerUpdateModuleFactory<TSendBody, TReceiveBody>(
    'SetTransferRule',
    { skipAuthentication: false },
)((
    _,
    {
        coinsMatchRule,
        source,
        destination,
        disabledGroups,
        ...restProps
    }: TTransferBlockingRuleCreate | TTransferBlockingRuleUpdate,
) => {
    return {
        params: {
            ...restProps,
            coin: convertToServerRuleCoin(coinsMatchRule),
            source: convertToServerRuleVertex(source),
            destination: convertToServerRuleVertex(destination),
            disableManual:
                disabledGroups === ERuleGroups.All || disabledGroups === ERuleGroups.Manual,
            disableSuggest:
                disabledGroups === ERuleGroups.All || disabledGroups === ERuleGroups.Suggest,
        },
    };
});
