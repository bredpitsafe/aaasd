import type { TBacktestingTaskId } from '@frontend/common/src/types/domain/backtestings';
import { EGrpcErrorCode, GrpcError } from '@frontend/common/src/types/GrpcError';
import { createRemoteProcedureCall } from '@frontend/common/src/utils/RPC/createRemoteProcedureCall';
import { createRemoteProcedureDescriptor } from '@frontend/common/src/utils/RPC/createRemoteProcedureDescriptor';
import {
    EPlatformSocketRemoteProcedureName,
    ERemoteProcedureType,
} from '@frontend/common/src/utils/RPC/defs';
import { catchError } from 'rxjs/operators';

type TSendBody = {
    id: TBacktestingTaskId;
};

type TReceiveBody = {
    type: 'BacktestTaskRemoved';
};

const descriptor = createRemoteProcedureDescriptor<TSendBody, TReceiveBody>()(
    EPlatformSocketRemoteProcedureName.RemoveBacktestTask,
    ERemoteProcedureType.Update,
);

export const ModuleDeleteBacktestingTask = createRemoteProcedureCall(descriptor)({
    getPipe: (params) =>
        catchError((err) => {
            throw new GrpcError(`Failed to delete Backtesting Task(${params.id})`, {
                code: err.code ?? EGrpcErrorCode.UNKNOWN,
                cause: err,
                description: err.message,
            });
        }),
});
