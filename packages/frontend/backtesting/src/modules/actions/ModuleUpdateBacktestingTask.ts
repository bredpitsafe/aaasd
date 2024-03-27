import type { TBacktestingTask } from '@frontend/common/src/types/domain/backtestings';
import { EGrpcErrorCode, GrpcError } from '@frontend/common/src/types/GrpcError';
import { createRemoteProcedureCall } from '@frontend/common/src/utils/RPC/createRemoteProcedureCall';
import { createRemoteProcedureDescriptor } from '@frontend/common/src/utils/RPC/createRemoteProcedureDescriptor';
import {
    EPlatformSocketRemoteProcedureName,
    ERemoteProcedureType,
} from '@frontend/common/src/utils/RPC/defs';
import { catchError } from 'rxjs/operators';

type TSendBody = Pick<TBacktestingTask, 'id' | 'name' | 'description' | 'scoreIndicator'>;

type TReceiveBody = {
    type: 'UpdatedBacktestTask';
};

const descriptor = createRemoteProcedureDescriptor<TSendBody, TReceiveBody>()(
    EPlatformSocketRemoteProcedureName.UpdateBacktestTask,
    ERemoteProcedureType.Update,
);

export const ModuleUpdateBacktestingTask = createRemoteProcedureCall(descriptor)({
    getPipe: (params) =>
        catchError((err) => {
            throw new GrpcError(`Failed to update Backtesting Task(${params.id})`, {
                code: err.code ?? EGrpcErrorCode.UNKNOWN,
                cause: err,
                description: err.message,
            });
        }),
});
