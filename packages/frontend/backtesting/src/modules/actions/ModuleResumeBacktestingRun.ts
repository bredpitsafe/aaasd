import { sum } from '@common/utils';
import { getNowMilliseconds, milliseconds2nanoseconds, monthInMilliseconds } from '@common/utils';
import type { TBacktestingRunId } from '@frontend/common/src/types/domain/backtestings';
import type { TSocketURL } from '@frontend/common/src/types/domain/sockets';
import { EGrpcErrorCode, GrpcError } from '@frontend/common/src/types/GrpcError';
import { catchError } from 'rxjs/operators';

import { createModuleChangeBacktestingRunBreakTime } from './createModuleChangeBacktestingRunBreakTime';

export const ModuleResumeBacktestingRun = createModuleChangeBacktestingRunBreakTime({
    getParams: (props: { target: TSocketURL; btRunNo: TBacktestingRunId }) => {
        return {
            ...props,
            cycleRoundMode: 'Ceil',
            breakTime: milliseconds2nanoseconds(
                sum(getNowMilliseconds(), monthInMilliseconds * 12),
            ),
        };
    },
    getPipe: (params) =>
        catchError((err) => {
            throw new GrpcError(`Failed to resume Backtesting Run(${params.btRunNo})`, {
                code: err.code ?? EGrpcErrorCode.UNKNOWN,
                cause: err,
                description: err.message,
            });
        }),
});
