import type {
    TBacktestingTask,
    TBacktestingTaskCreateParams,
    TValidationTemplateErrors,
} from '@frontend/common/src/types/domain/backtestings';
import { EGrpcErrorCode, GrpcError } from '@frontend/common/src/types/GrpcError';
import { EMPTY_ARRAY } from '@frontend/common/src/utils/const';
import { createRemoteProcedureCall } from '@frontend/common/src/utils/RPC/createRemoteProcedureCall';
import { createRemoteProcedureDescriptor } from '@frontend/common/src/utils/RPC/createRemoteProcedureDescriptor';
import {
    ERemoteProcedureType,
    EServerRemoteProcedureName,
} from '@frontend/common/src/utils/RPC/defs';
import { mapValueDescriptor } from '@frontend/common/src/utils/Rx/ValueDescriptor2';
import { throwingError } from '@frontend/common/src/utils/throwingError';
import { pipe } from 'rxjs';

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
    EServerRemoteProcedureName.CreateAndStartBacktestTask,
    ERemoteProcedureType.Update,
);

export const ModuleCreateAndStartBacktestingTask = createRemoteProcedureCall(descriptor)({
    getPipe: () =>
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
            mapValueDescriptor((vd) => {
                if (vd.value.payload.type === 'ValidateBacktestTaskResult') {
                    return vd.value.payload.errors ?? EMPTY_ARRAY;
                }

                return vd.value.payload.id;
            }),
        ),
});
