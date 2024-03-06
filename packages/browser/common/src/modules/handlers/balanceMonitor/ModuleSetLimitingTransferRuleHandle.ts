import type {
    TAmount,
    TAmountLimitsRuleCreate,
    TAmountLimitsRuleUpdate,
    TCoinId,
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
    amountMin?: TAmount;
    amountMax?: TAmount;
    amountCurrency: TCoinId;
    rulePriority: number;
    doNotOverride: boolean;
};

type TReceiveBody = { type: 'LimitingTransferRuleApplied' };

export const ModuleSetLimitingTransferRuleHandle = ServerUpdateModuleFactory<
    TSendBody,
    TReceiveBody
>('SetLimitingTransferRule', { skipAuthentication: false })((
    _,
    {
        coinsMatchRule,
        source,
        destination,
        ...restProps
    }: TAmountLimitsRuleCreate | TAmountLimitsRuleUpdate,
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
