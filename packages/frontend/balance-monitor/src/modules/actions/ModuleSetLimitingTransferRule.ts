import type {
    TAmount,
    TAmountLimitsRuleCreate,
    TAmountLimitsRuleUpdate,
    TCoinId,
    TRuleId,
} from '@frontend/common/src/types/domain/balanceMonitor/defs';
import type { TSocketStruct, TSocketURL } from '@frontend/common/src/types/domain/sockets.ts';
import { createRemoteProcedureCall } from '@frontend/common/src/utils/RPC/createRemoteProcedureCall.ts';
import { createRemoteProcedureDescriptor } from '@frontend/common/src/utils/RPC/createRemoteProcedureDescriptor.ts';
import {
    EPlatformSocketRemoteProcedureName,
    ERemoteProcedureType,
} from '@frontend/common/src/utils/RPC/defs.ts';

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

const descriptor = createRemoteProcedureDescriptor<TSendBody, TReceiveBody>()(
    EPlatformSocketRemoteProcedureName.SetLimitingTransferRule,
    ERemoteProcedureType.Update,
);

export const ModuleSetLimitingTransferRule = createRemoteProcedureCall(descriptor)({
    getParams: ({
        coinsMatchRule,
        source,
        destination,
        ...restProps
    }: { target: TSocketURL | TSocketStruct } & (
        | TAmountLimitsRuleCreate
        | TAmountLimitsRuleUpdate
    )) => {
        return {
            ...restProps,
            coin: convertToServerRuleCoin(coinsMatchRule),
            source: convertToServerRuleVertex(source),
            destination: convertToServerRuleVertex(destination),
        };
    },
});
