import type { TBacktestingTask, TBacktestingTaskConfigs } from '../../../types/domain/backtestings';
import { createRemoteProcedureCall } from '../../../utils/RPC/createRemoteProcedureCall';
import { createRemoteProcedureDescriptor } from '../../../utils/RPC/createRemoteProcedureDescriptor';
import { EPlatformSocketRemoteProcedureName, ERemoteProcedureType } from '../../../utils/RPC/defs';
import { mapValueDescriptor } from '../../../utils/Rx/ValueDescriptor2';

type TSendBody = {
    taskId: TBacktestingTask['id'];
};

type TReceiveBody = {
    type: 'BacktestTaskConfigs';
} & TBacktestingTaskConfigs;

const descriptor = createRemoteProcedureDescriptor<TSendBody, TReceiveBody>()(
    EPlatformSocketRemoteProcedureName.FetchBacktestTaskConfigs,
    ERemoteProcedureType.Request,
);

export const ModuleFetchBacktestingTaskConfigs = createRemoteProcedureCall(descriptor)({
    getPipe: () => mapValueDescriptor((vd) => vd.value.payload),
});
