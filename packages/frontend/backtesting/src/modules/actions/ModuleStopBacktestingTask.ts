import type { TBacktestingTask } from '@frontend/common/src/types/domain/backtestings';
import { EGrpcErrorCode, GrpcError } from '@frontend/common/src/types/GrpcError';
import { createRemoteProcedureCall } from '@frontend/common/src/utils/RPC/createRemoteProcedureCall';
import { createRemoteProcedureDescriptor } from '@frontend/common/src/utils/RPC/createRemoteProcedureDescriptor';
import {
    EPlatformSocketRemoteProcedureName,
    ERemoteProcedureType,
} from '@frontend/common/src/utils/RPC/defs';
import { catchError } from 'rxjs/operators';

type TSendBody = {
    id: TBacktestingTask['id'];
};

type TReceiveBody = {
    type: 'BacktestTaskStopped';
};

const descriptor = createRemoteProcedureDescriptor<TSendBody, TReceiveBody>()(
    EPlatformSocketRemoteProcedureName.StopBacktestTask,
    ERemoteProcedureType.Update,
);

export const ModuleStopBacktestingTask = createRemoteProcedureCall(descriptor)({
    getPipe: (params) =>
        catchError((err) => {
            throw new GrpcError(`Failed to stop Backtesting Task(${params.id})`, {
                code: err.code ?? EGrpcErrorCode.UNKNOWN,
                cause: err,
                description: err.message,
            });
        }),
});
