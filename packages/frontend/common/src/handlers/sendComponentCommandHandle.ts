import type { Observable, OperatorFunction } from 'rxjs';
import { map, take } from 'rxjs/operators';

import { TReceivedData } from '../lib/BFFSocket/def';
import { EErrorReason } from '../lib/SocketStream/def';
import { SocketStreamError } from '../lib/SocketStream/SocketStreamError';
import { TFetchHandler, THandlerOptions } from '../modules/communicationHandlers/def';
import type { EComponentType, TComponentTypeToTypeId } from '../types/domain/component';
import { TSocketURL } from '../types/domain/sockets';
import { EGrpcErrorCode } from '../types/GrpcError';
import { TStructurallyCloneableObject } from '../types/serialization';
import { tapError } from '../utils/Rx/tap';
import { logger } from '../utils/Tracing';
import type { EComponentCommands } from './def';
import { getTraceId } from './utils';

type SendBody<T extends EComponentType, ID extends TComponentTypeToTypeId[T]> = {
    type: 'ExecCommand';
    id: ID;
    command: EComponentCommands;
    commandData?: TStructurallyCloneableObject | string;
};

type ServerError = string | { reason: string } | { message: string };

type ReceiveBody<T extends object> = Partial<T> & {
    result?: {
        Ok?: T;
        Err?: ServerError;
    };
};

export function requestComponentCommandHandle<
    Payload extends TStructurallyCloneableObject,
    Type extends EComponentType = EComponentType,
    IdType extends TComponentTypeToTypeId[Type] = TComponentTypeToTypeId[Type],
>(
    handler: TFetchHandler,
    url: TSocketURL,
    id: IdType,
    command: EComponentCommands,
    commandData?: TStructurallyCloneableObject | string,
    options?: Partial<THandlerOptions>,
): Observable<TReceivedData<Payload>> {
    const traceId = getTraceId(options);

    logger.trace('[requestComponentCommandHandle]: init observable', {
        traceId,
    });

    return handler<SendBody<Type, IdType>, ReceiveBody<Payload>>(
        url,
        {
            type: 'ExecCommand',
            id,
            command,
            commandData,
        },
        { ...options, traceId },
    ).pipe(
        take(1),
        extractEnvelope(url, command),
        tapError((err: SocketStreamError) => logger.error(err)),
    );
}

export function updateComponentCommandHandle<
    Payload extends TStructurallyCloneableObject,
    Type extends EComponentType = EComponentType,
    IdType extends TComponentTypeToTypeId[Type] = TComponentTypeToTypeId[Type],
>(
    handler: TFetchHandler,
    url: TSocketURL,
    id: IdType,
    command: EComponentCommands,
    commandData?: TStructurallyCloneableObject | string,
    options?: Partial<Omit<THandlerOptions, 'retries'>>,
): Observable<TReceivedData<Payload>> {
    const traceId = getTraceId(options);

    logger.trace('[updateComponentCommandHandle]: init observable', {
        traceId,
    });

    return handler<SendBody<Type, IdType>, ReceiveBody<Payload>>(
        url,
        {
            type: 'ExecCommand',
            id,
            command,
            commandData,
        },
        { ...options, traceId },
    ).pipe(
        take(1),
        extractEnvelope(url, command),
        tapError((err: SocketStreamError) => logger.error(err)),
    );
}

function extractEnvelope<Payload extends object>(
    url: TSocketURL,
    command: EComponentCommands,
): OperatorFunction<TReceivedData<ReceiveBody<Payload>>, TReceivedData<Payload>> {
    return map((envelope: TReceivedData<ReceiveBody<Payload>>) => {
        if (envelope.payload.result?.Err !== undefined) {
            throw new SocketStreamError(extractErrorMessage(envelope.payload.result.Err), {
                code: EGrpcErrorCode.UNKNOWN,
                reason: EErrorReason.serverError,
                traceId: envelope.traceId,
                correlationId: envelope.correlationId,
                socketURL: url,
            });
        }

        const payload = (
            typeof envelope.payload.result === 'object'
                ? envelope.payload.result.Ok
                : envelope.payload
        ) as Payload | void;

        if (payload === undefined) {
            const message = `Incorrect response for command: ${command}`;

            throw new SocketStreamError(message, {
                code: EGrpcErrorCode.UNKNOWN,
                reason: EErrorReason.serverError,
                traceId: envelope.traceId,
                correlationId: envelope.correlationId,
                socketURL: url,
            });
        }

        return {
            ...envelope,
            payload,
        };
    });
}

function extractErrorMessage(err: ServerError): string {
    return typeof err === 'string'
        ? err
        : 'reason' in err
          ? err.reason
          : 'message' in err
            ? err.message
            : '';
}
