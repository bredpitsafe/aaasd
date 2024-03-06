import { TBacktestingRunId } from '@frontend/common/src/types/domain/backtestings';
import { Nanoseconds } from '@frontend/common/src/types/time';
import { createRemoteProcedureCall } from '@frontend/common/src/utils/RPC/createRemoteProcedureCall';
import { createRemoteProcedureDescriptor } from '@frontend/common/src/utils/RPC/createRemoteProcedureDescriptor';
import {
    ERemoteProcedureType,
    EServerRemoteProcedureName,
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
    EServerRemoteProcedureName.ContinueBacktest,
    ERemoteProcedureType.Update,
);

export const createModuleChangeBacktestingRunBreakTime = createRemoteProcedureCall(descriptor);
