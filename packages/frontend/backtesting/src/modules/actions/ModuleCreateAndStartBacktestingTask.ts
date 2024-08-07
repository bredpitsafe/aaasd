import { assert } from '@common/utils';
import { ModuleSubscribeToBacktestingTask } from '@frontend/common/src/actors/BacktestingDataProviders/actions/ModuleSubscribeToBacktestingTask.ts';
import type { TContextRef } from '@frontend/common/src/di';
import { ModuleFactory } from '@frontend/common/src/di';
import type {
    TBacktestingTask,
    TBacktestingTaskCreateParams,
    TValidationTemplateErrors,
} from '@frontend/common/src/types/domain/backtestings';
import { EGrpcErrorCode, GrpcError } from '@frontend/common/src/types/GrpcError';
import { EMPTY_ARRAY } from '@frontend/common/src/utils/const.ts';
import { createRemoteProcedureCall } from '@frontend/common/src/utils/RPC/createRemoteProcedureCall';
import { createRemoteProcedureDescriptor } from '@frontend/common/src/utils/RPC/createRemoteProcedureDescriptor';
import {
    EPlatformSocketRemoteProcedureName,
    ERemoteProcedureType,
} from '@frontend/common/src/utils/RPC/defs';
import {
    mapValueDescriptor,
    switchMapValueDescriptor,
    takeWhileFirstSyncValueDescriptor,
} from '@frontend/common/src/utils/Rx/ValueDescriptor2';
import { throwingError } from '@frontend/common/src/utils/throwingError';
import { convertErrToGrpcFail } from '@frontend/common/src/utils/ValueDescriptor/Fails.ts';
import {
    createUnsyncedValueDescriptor,
    isSyncedValueDescriptor,
} from '@frontend/common/src/utils/ValueDescriptor/utils.ts';
import { isNil } from 'lodash-es';
import { from, of, pipe, timeout } from 'rxjs';
import { filter, map } from 'rxjs/operators';

type TSendBody = TBacktestingTaskCreateParams;

type TReceiveBody = {
    type: 'BacktestTaskStarted';
    id: TBacktestingTask['id'];
};

type TReceiveError = {
    type: 'ValidateBacktestTaskResult';
    errors: null | TValidationTemplateErrors[];
};

const descriptor = createRemoteProcedureDescriptor<TSendBody, TReceiveBody | TReceiveError>()(
    EPlatformSocketRemoteProcedureName.CreateAndStartBacktestTask,
    ERemoteProcedureType.Update,
);

const TASK_TO_ARRIVE_IN_SUBSCRIPTION_TIMEOUT = 10000;

export const ModuleCreateAndStartBacktestingTask = ModuleFactory((ctx: TContextRef) => {
    const subscribeToBacktestingTask = ModuleSubscribeToBacktestingTask(ctx);

    return createRemoteProcedureCall(descriptor)({
        getPipe: (params, options) =>
            pipe(
                mapValueDescriptor((vd) => {
                    switch (vd.value.payload.type) {
                        case 'BacktestTaskStarted':
                        case 'ValidateBacktestTaskResult':
                            return vd;
                        default:
                            return throwingError(
                                new GrpcError('Backtesting Task has validation errors', {
                                    code: EGrpcErrorCode.INVALID_ARGUMENT,
                                }),
                            );
                    }
                }),
                switchMapValueDescriptor((vd) => {
                    if (vd.value.payload.type === 'ValidateBacktestTaskResult') {
                        return of(vd);
                    }

                    // After task has been created successfully, we should wait for it to appear in the subscription
                    // before finishing the request stream. Otherwise, returning task ID too early may lead to unwanted side effects
                    // (e.g. receiving errors upon trying to subscribe to such task).
                    const id = vd.value.payload.id;
                    return subscribeToBacktestingTask(params.target, id, options).pipe(
                        // Skip all errors because they'll happen if the task doesn't exist yet,
                        // but we don't want them to be propagated to the end user, as it's an expected behavior.
                        filter((vd) => isSyncedValueDescriptor(vd)),
                        takeWhileFirstSyncValueDescriptor(),
                        map((taskVd) => {
                            assert(!isNil(taskVd.value), 'received empty task from subscription');
                            assert(
                                id === taskVd.value.id,
                                'received task with ID that differs from created ID',
                            );
                            return vd;
                        }),
                        timeout({
                            first: TASK_TO_ARRIVE_IN_SUBSCRIPTION_TIMEOUT,
                            // If we haven't received task in the subscription after creating it,
                            // Throw an error into the stream, then immediately follow by synced VD to complete the operation anyway.
                            with: () =>
                                from([
                                    createUnsyncedValueDescriptor(
                                        convertErrToGrpcFail(
                                            new GrpcError(
                                                'Task has been created but failed to show up in the subscription',
                                                {
                                                    code: EGrpcErrorCode.ABORTED,
                                                    description: 'It may arrive at a later time.',
                                                    traceId: options.traceId,
                                                },
                                            ),
                                        ),
                                    ),
                                    vd,
                                ]),
                        }),
                    );
                }),
                mapValueDescriptor((vd) => {
                    if (vd.value.payload.type === 'ValidateBacktestTaskResult') {
                        return (
                            vd.value.payload.errors ?? (EMPTY_ARRAY as TValidationTemplateErrors[])
                        );
                    }

                    return vd.value.payload.id;
                }),
            ),
    })(ctx);
});
