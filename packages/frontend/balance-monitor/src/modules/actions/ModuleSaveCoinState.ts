import type { TCoinId } from '@frontend/common/src/types/domain/balanceMonitor/defs';
import { createRemoteProcedureCall } from '@frontend/common/src/utils/RPC/createRemoteProcedureCall.ts';
import { createRemoteProcedureDescriptor } from '@frontend/common/src/utils/RPC/createRemoteProcedureDescriptor.ts';
import {
    EPlatformSocketRemoteProcedureName,
    ERemoteProcedureType,
} from '@frontend/common/src/utils/RPC/defs.ts';

type TSendBody = {
    coin: TCoinId;
    comment: string;
};

type TReceiveBody = {
    type: 'CoinStateSaved';
};

const descriptor = createRemoteProcedureDescriptor<TSendBody, TReceiveBody>()(
    EPlatformSocketRemoteProcedureName.SaveCoinState,
    ERemoteProcedureType.Update,
);

export const ModuleSaveCoinState = createRemoteProcedureCall(descriptor)();
