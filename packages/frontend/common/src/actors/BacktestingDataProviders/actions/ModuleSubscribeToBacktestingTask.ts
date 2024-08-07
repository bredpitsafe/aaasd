import { isUndefined } from 'lodash-es';
import type { Observable } from 'rxjs';

import { ModuleFactory } from '../../../di';
import type { TWithTraceId } from '../../../modules/actions/def.ts';
import type { TBacktestingTask, TBacktestingTaskId } from '../../../types/domain/backtestings';
import type { TSocketStruct, TSocketURL } from '../../../types/domain/sockets';
import { Fail } from '../../../types/Fail';
import { EGrpcErrorCode } from '../../../types/GrpcError';
import { mapValueDescriptor } from '../../../utils/Rx/ValueDescriptor2';
import type { TValueDescriptor2 } from '../../../utils/ValueDescriptor/types';
import {
    createSyncedValueDescriptor,
    createUnsyncedValueDescriptor,
} from '../../../utils/ValueDescriptor/utils';
import { ModuleSubscribeToBacktestingTasksSnapshot } from './ModuleSubscribeToBacktestingTasksSnapshot';

export const ModuleSubscribeToBacktestingTask = ModuleFactory((ctx) => {
    const subscribeToBacktestingTasksSnapshot = ModuleSubscribeToBacktestingTasksSnapshot(ctx);

    return (
        target: TSocketURL | TSocketStruct,
        taskId: TBacktestingTaskId,
        options: TWithTraceId,
    ): Observable<TValueDescriptor2<TBacktestingTask>> => {
        return subscribeToBacktestingTasksSnapshot(
            target,
            {
                filters: {
                    ids: [taskId],
                },
            },
            options,
        ).pipe(
            mapValueDescriptor(({ value: tasks }) => {
                const task = tasks.at(0);

                return isUndefined(task)
                    ? createUnsyncedValueDescriptor(
                          Fail(EGrpcErrorCode.NOT_FOUND, {
                              message: `Backtesting task(id: ${taskId}) not found`,
                              traceId: options.traceId,
                          }),
                      )
                    : createSyncedValueDescriptor(task);
            }),
        );
    };
});
