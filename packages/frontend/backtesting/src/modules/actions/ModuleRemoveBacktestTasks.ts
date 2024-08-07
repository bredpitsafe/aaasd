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
    ids: TBacktestingTaskId[];
};

type TReceiveBody = {
    type: 'BacktestTasksRemoved';
};

const descriptor = createRemoteProcedureDescriptor<TSendBody, TReceiveBody>()(
    EPlatformSocketRemoteProcedureName.RemoveBacktestTasks,
    ERemoteProcedureType.Update,
);

export const ModuleRemoveBacktestTasks = createRemoteProcedureCall(descriptor)({
    getPipe: (params) =>
        catchError((err) => {
            throw new GrpcError(`Failed to delete ${params.ids.length} Backtesting Tasks`, {
                code: err.code ?? EGrpcErrorCode.UNKNOWN,
                cause: err,
                description: err.message,
            });
        }),
});
