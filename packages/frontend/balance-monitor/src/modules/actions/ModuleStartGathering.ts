import type {
    TAmount,
    TCoinId,
    TExchangeId,
} from '@frontend/common/src/types/domain/balanceMonitor/defs';
import { createRemoteProcedureCall } from '@frontend/common/src/utils/RPC/createRemoteProcedureCall.ts';
import { createRemoteProcedureDescriptor } from '@frontend/common/src/utils/RPC/createRemoteProcedureDescriptor.ts';
import {
    EPlatformSocketRemoteProcedureName,
    ERemoteProcedureType,
} from '@frontend/common/src/utils/RPC/defs.ts';

type TSendBody = {
    exchange: TExchangeId;
    coin: TCoinId;
    amount: TAmount;
};

type TReceiveBody = {
    type: 'Success';
};

const descriptor = createRemoteProcedureDescriptor<TSendBody, TReceiveBody>()(
    EPlatformSocketRemoteProcedureName.StartGathering,
    ERemoteProcedureType.Update,
);

export const ModuleStartGathering = createRemoteProcedureCall(descriptor)();
