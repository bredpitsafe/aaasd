import { DEDUPE_REMOVE_DELAY, SHARE_RESET_DELAY } from '@frontend/common/src/defs/observables.ts';
import type {
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
import hash_sum from 'hash-sum';

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
    dedobs: {
        normalize: ([params]) => hash_sum(params),
        resetDelay: SHARE_RESET_DELAY,
        removeDelay: DEDUPE_REMOVE_DELAY,
    },
});
