import { isNil, isObject, isUndefined } from 'lodash-es';

import { EErrorReason } from '../../../lib/SocketStream/def.ts';
import { SocketStreamError } from '../../../lib/SocketStream/SocketStreamError.ts';
import type { TComponentId } from '../../../types/domain/component.ts';
import type { TWithSocketTarget } from '../../../types/domain/sockets.ts';
import { EGrpcErrorCode } from '../../../types/GrpcError.ts';
import type { TStructurallyCloneableObject } from '../../../types/serialization.ts';
import { createRemoteProcedureCall } from '../../../utils/RPC/createRemoteProcedureCall.ts';
import { createRemoteProcedureDescriptor } from '../../../utils/RPC/createRemoteProcedureDescriptor.ts';
import {
    EPlatformSocketRemoteProcedureName,
    ERemoteProcedureType,
} from '../../../utils/RPC/defs.ts';
import { mapValueDescriptor } from '../../../utils/Rx/ValueDescriptor2.ts';
import { createSyncedValueDescriptor } from '../../../utils/ValueDescriptor/utils.ts';
import type { EComponentCommands } from '../def.ts';

type TSendBody = {
    id: TComponentId;
    command: EComponentCommands;
    commandData?: TStructurallyCloneableObject | string;
};

type TServerError = string | { reason: string } | { message: string };

type TReceiveBody =
    | TStructurallyCloneableObject
    | { result: { Ok: TStructurallyCloneableObject } }
    | { result: { Err: TServerError } };

const getDescriptor = createRemoteProcedureDescriptor<TSendBody, TReceiveBody>();
const updateDescriptor = getDescriptor(
    EPlatformSocketRemoteProcedureName.ExecCommand,
    ERemoteProcedureType.Update,
);
const requestDescriptor = getDescriptor(
    EPlatformSocketRemoteProcedureName.ExecCommand,
    ERemoteProcedureType.Request,
);

export const ModuleExecUpdateComponentCommand = createRemoteProcedureCall(updateDescriptor)({
    getPipe: extractSyncValue,
});

export const ModuleExecRequestComponentCommand = createRemoteProcedureCall(requestDescriptor)({
    getPipe: extractSyncValue,
});

function extractSyncValue(params: TWithSocketTarget & TSendBody) {
    return mapValueDescriptor(({ value }) => {
        const result =
            'result' in value.payload && isObject(value.payload.result)
                ? value.payload.result
                : undefined;
        const error =
            isObject(result) && 'Err' in result ? (result.Err as TServerError) : undefined;
        const socketURL =
            isObject(params.target) && 'url' in params.target ? params.target.url : params.target;

        if (!isUndefined(error)) {
            throw new SocketStreamError(extractErrorMessage(error), {
                code: EGrpcErrorCode.UNKNOWN,
                reason: EErrorReason.serverError,
                traceId: value.traceId,
                correlationId: value.correlationId,
                socketURL,
            });
        }

        const payload = (
            result && 'Ok' in result ? result.Ok : value.payload
        ) as TStructurallyCloneableObject;

        if (isNil(payload)) {
            const message = `Incorrect response for command: ${params.command}`;

            throw new SocketStreamError(message, {
                code: EGrpcErrorCode.UNKNOWN,
                reason: EErrorReason.serverError,
                traceId: value.traceId,
                correlationId: value.correlationId,
                socketURL,
            });
        }

        return createSyncedValueDescriptor(payload);
    });
}

function extractErrorMessage(err: TServerError): string {
    return typeof err === 'string'
        ? err
        : 'reason' in err
          ? err.reason
          : 'message' in err
            ? err.message
            : '';
}
