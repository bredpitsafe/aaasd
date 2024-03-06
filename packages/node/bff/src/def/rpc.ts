import { TAuthRoutesMap } from '../modules/auth/def.ts';
import { TGeneralRoutesMap } from '../modules/root/def.ts';
import { TStagesRoutesMap } from '../modules/stages/def.ts';
import { TTradingDataProviderRoutesMap } from '../modules/tradingDataProvider/def.ts';
import { TCorrelationId } from '../utils/correlationId.ts';
import { TraceId } from '../utils/traceId.ts';

export enum ERpcErrorCode {
    OK = 0,
    CANCELLED = 1,
    UNKNOWN = 2,
    INVALID_ARGUMENT = 3,
    DEADLINE_EXCEEDED = 4,
    NOT_FOUND = 5,
    ALREADY_EXISTS = 6,
    PERMISSION_DENIED = 7,
    RESOURCE_EXHAUSTED = 8,
    FAILED_PRECONDITION = 9,
    ABORTED = 10,
    OUT_OF_RANGE = 11,
    UNIMPLEMENTED = 12,
    INTERNAL = 13,
    UNAVAILABLE = 14,
    DATA_LOSS = 15,
    UNAUTHENTICATED = 16,
}

export enum ERpcResponseState {
    Done = 'Done',
    InProgress = 'InProgress',
}

export type TRpcError = {
    code: ERpcErrorCode;
    message: string;
    args?: {};
};

/* Single request-response */
export type TRpcApi<T, U> = {
    request: {
        timestamp: string;
        traceId: TraceId;
        correlationId: TCorrelationId;
        payload: T;
    };
    response: {
        timestamp: string;
        traceId: TraceId;
        correlationId: TCorrelationId;
        state: ERpcResponseState;
    } & ({ payload: U; error?: never } | { error: TRpcError; payload?: never });
};

/**
 * @public
 */
export type TRpcApiMap = TGeneralRoutesMap &
    TStagesRoutesMap &
    TAuthRoutesMap &
    TTradingDataProviderRoutesMap;

export type TRpcRouteName = keyof TRpcApiMap;

export type TRpcRequest<K extends TRpcRouteName = TRpcRouteName> = TRpcApiMap[K]['request'];

export type TRpcResponse<K extends TRpcRouteName = TRpcRouteName> = TRpcApiMap[K]['response'];

/**
 * @public
 */
export type TRpcRequestPayload<K extends TRpcRouteName> = TRpcRequest<K>['payload'];

export type TRpcResponsePayload<K extends TRpcRouteName = TRpcRouteName> = NonNullable<
    TRpcResponse<K>['payload']
>;
