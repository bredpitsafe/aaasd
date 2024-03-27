import type {
    TAutoTransferRuleCreate,
    TAutoTransferRuleUpdate,
    TRuleId,
} from '../../../types/domain/balanceMonitor/defs';
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
    enableAuto: boolean;
    rulePriority: number;
};

type TReceiveBody = { type: 'AutoTransferRuleApplied' };

export const ModuleSetAutoTransferRuleHandle = ServerUpdateModuleFactory<TSendBody, TReceiveBody>(
    'SetAutoTransferRule',
    { skipAuthentication: false },
)((
    _,
    {
        coinsMatchRule,
        source,
        destination,
        ...restProps
    }: TAutoTransferRuleCreate | TAutoTransferRuleUpdate,
) => {
    return {
        params: {
            ...restProps,
            coin: convertToServerRuleCoin(coinsMatchRule),
            source: convertToServerRuleVertex(source),
            destination: convertToServerRuleVertex(destination),
        },
    };
});
