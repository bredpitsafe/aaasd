import { isObject, isString } from 'lodash-es';

import { ERpcErrorCode, TRpcError } from '../def/rpc.ts';
import { GrpcClientError } from '../transport/grpc/client/error.ts';

export class RpcError extends Error implements TRpcError {
    constructor(
        public code: ERpcErrorCode,
        public message: string,
        public args: Record<string, unknown> = {},
    ) {
        super(message);
        Object.setPrototypeOf(this, RpcError.prototype);
        Error.captureStackTrace(this, RpcError);
    }
}

export function toRpcError(err: unknown): TRpcError {
    if (err instanceof RpcError) {
        return err;
    }
    if (err instanceof GrpcClientError) {
        return new RpcError(err.code as unknown as ERpcErrorCode, err.message, {
            originalError: err,
        });
    }
    if (isObject(err) && 'message' in err && isString(err.message)) {
        return internalProcessingError(err.message);
    }
    return internalProcessingError(err);
}

/**
 * @public
 */
export function internalProcessingError(originalError: unknown) {
    return new RpcError(
        ERpcErrorCode.INTERNAL,
        'Request processing error. Internal error occurred while processing the request. Please file a bug report and provide client logs.',
        { originalError },
    );
}

/**
 * @public
 */
export function requestTimeoutError(timeoutMs: number) {
    return new RpcError(
        ERpcErrorCode.DEADLINE_EXCEEDED,
        `The request failed to receive a response within the specified timeout of ${timeoutMs}ms.`,
        { timeoutMs },
    );
}

/**
 * @public
 */
export function requestParseError(originalError: string) {
    return new RpcError(
        ERpcErrorCode.INVALID_ARGUMENT,
        'Failed to parse request body. Please file a bug report and provide client logs.',
        { originalError },
    );
}

/**
 * @public
 */
export function validationFailError(type: 'request' | 'response') {
    return new RpcError(
        ERpcErrorCode.INVALID_ARGUMENT,
        `${type} validation error: ${type} body is missing required fields since it does not match any request schema.`,
    );
}

/**
 * @public
 */
export function notAuthenticatedError() {
    return new RpcError(
        ERpcErrorCode.UNAUTHENTICATED,
        'Request authentication error: the request is not authenticated.',
    );
}

/**
 * @public
 */
export function tokenVerificationError(originalError: unknown) {
    return new RpcError(
        ERpcErrorCode.UNAUTHENTICATED,
        'Request authentication error: the request is not authenticated.',
        { originalError },
    );
}
