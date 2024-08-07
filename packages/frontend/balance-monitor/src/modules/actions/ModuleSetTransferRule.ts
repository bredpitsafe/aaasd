import type { ISO } from '@common/types';
import type {
    TRuleId,
    TTransferBlockingRuleCreate,
    TTransferBlockingRuleUpdate,
} from '@frontend/common/src/types/domain/balanceMonitor/defs';
import { ERuleGroups } from '@frontend/common/src/types/domain/balanceMonitor/defs';
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
    showAlert: boolean;
    disableManual: boolean;
    disableSuggest: boolean;
    since?: ISO;
    until?: ISO;
};

type TReceiveBody = { type: 'TransferRuleApplied' };

const descriptor = createRemoteProcedureDescriptor<TSendBody, TReceiveBody>()(
    EPlatformSocketRemoteProcedureName.SetTransferRule,
    ERemoteProcedureType.Update,
);

export const ModuleSetTransferRule = createRemoteProcedureCall(descriptor)({
    getParams: ({
        coinsMatchRule,
        source,
        destination,
        disabledGroups,
        ...restProps
    }: { target: TSocketURL | TSocketStruct } & (
        | TTransferBlockingRuleCreate
        | TTransferBlockingRuleUpdate
    )) => {
        return {
            ...restProps,
            coin: convertToServerRuleCoin(coinsMatchRule),
            source: convertToServerRuleVertex(source),
            destination: convertToServerRuleVertex(destination),
            disableManual:
                disabledGroups === ERuleGroups.All || disabledGroups === ERuleGroups.Manual,
            disableSuggest:
                disabledGroups === ERuleGroups.All || disabledGroups === ERuleGroups.Suggest,
        };
    },
});
