import type { Nanoseconds } from '@common/types';
import type { TBacktestingRunId } from '@frontend/common/src/types/domain/backtestings';
import { createRemoteProcedureCall } from '@frontend/common/src/utils/RPC/createRemoteProcedureCall';
import { createRemoteProcedureDescriptor } from '@frontend/common/src/utils/RPC/createRemoteProcedureDescriptor';
import {
    EPlatformSocketRemoteProcedureName,
    ERemoteProcedureType,
} from '@frontend/common/src/utils/RPC/defs';

type TSendBody = {
    cycleRoundMode: 'Ceil';
    btRunNo: TBacktestingRunId;
    breakTime: Nanoseconds;
};

type TReceiveBody = {
    type: 'BacktestContinued';
};

const descriptor = createRemoteProcedureDescriptor<TSendBody, TReceiveBody>()(
    EPlatformSocketRemoteProcedureName.ContinueBacktest,
    ERemoteProcedureType.Update,
);

export const createModuleChangeBacktestingRunBreakTime = createRemoteProcedureCall(descriptor);
