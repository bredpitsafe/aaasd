import {
    TBacktestingTaskCreateParams,
    TValidationTemplateErrors,
} from '@frontend/common/src/types/domain/backtestings';
import { createRemoteProcedureCall } from '@frontend/common/src/utils/RPC/createRemoteProcedureCall';
import { createRemoteProcedureDescriptor } from '@frontend/common/src/utils/RPC/createRemoteProcedureDescriptor';
import {
    EPlatformSocketRemoteProcedureName,
    ERemoteProcedureType,
} from '@frontend/common/src/utils/RPC/defs';
import { mapValueDescriptor } from '@frontend/common/src/utils/Rx/ValueDescriptor2';

type TSendBody = Omit<TBacktestingTaskCreateParams, 'simulationData'>;

type TReceiveBody = {
    type: 'ValidateBacktestTaskResult';
    errors: null | TValidationTemplateErrors[];
};

const descriptor = createRemoteProcedureDescriptor<TSendBody, TReceiveBody>()(
    EPlatformSocketRemoteProcedureName.ValidateBacktestTask,
    ERemoteProcedureType.Request,
);

export const ModuleValidateBacktestingTask = createRemoteProcedureCall(descriptor)({
    getPipe: () => mapValueDescriptor(({ value }) => value.payload.errors),
});
