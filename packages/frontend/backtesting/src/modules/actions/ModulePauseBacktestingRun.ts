import type { Nanoseconds } from '@common/types';
import type { TBacktestingRunId } from '@frontend/common/src/types/domain/backtestings';
import type { TSocketURL } from '@frontend/common/src/types/domain/sockets';
import { EGrpcErrorCode, GrpcError } from '@frontend/common/src/types/GrpcError';
import { catchError } from 'rxjs/operators';

import { createModuleChangeBacktestingRunBreakTime } from './createModuleChangeBacktestingRunBreakTime';

export const ModulePauseBacktestingRun = createModuleChangeBacktestingRunBreakTime({
    getParams: (props: { target: TSocketURL; btRunNo: TBacktestingRunId }) => {
        return {
            ...props,
            cycleRoundMode: 'Ceil',
            breakTime: 0 as Nanoseconds,
        };
    },
    getPipe: (params) =>
        catchError((err) => {
            throw new GrpcError(`Failed to suspend Backtesting Run(${params.btRunNo})`, {
                code: err.code ?? EGrpcErrorCode.UNKNOWN,
                cause: err,
                description: err.message,
            });
        }),
});
