import type { TCorrelationId } from '@backend/utils/src/correlationId.ts';
import type { TraceId } from '@common/utils';

import type { TAuthRoutesMap } from '../modules/auth/def.ts';
import type { TAuthorizationRoutesMap } from '../modules/authorization/def.ts';
import type { TDashboardStorageRoutesMap } from '../modules/dashboardStorage/def.ts';
import type { TInstrumentsRoutesMap } from '../modules/instruments/def.ts';
import type { TGeneralRoutesMap } from '../modules/root/def.ts';
import type { TStagesRoutesMap } from '../modules/stages/def.ts';
import type { TTimeseriesRoutesMap } from '../modules/timeseries/def.ts';
import type { TTradingDataProviderRoutesMap } from '../modules/tradingDataProvider/def.ts';
import type { TUserSettingsRoutesMap } from '../modules/userSettings/def.ts';
import type { WithMock } from './mock.ts';

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

export enum ERpcSubscriptionEvent {
    Ok = 'Ok',
    Snapshot = 'Snapshot',
    Updates = 'Updates',
}

export type TRpcError = {
    code: ERpcErrorCode;
    description: string;
    args?: {};
};

type TRpcBaseResponse = {
    timestamp: string;
    traceId: TraceId;
    correlationId: TCorrelationId;
};

/**
 * @public
 */
export type TRpcRequestBody<T> = {
    timestamp: string;
    traceId: TraceId;
    correlationId: TCorrelationId;
    payload: WithMock<T>;
};

/**
 * @public
 */
export type TRpcResponseBody<T> = TRpcBaseResponse &
    (
        | { payload: T; error?: never; state: ERpcResponseState }
        | { error: TRpcError; payload?: never; state: ERpcResponseState.Done }
        | { error?: never; payload?: never; state: ERpcResponseState.Done }
    );

/* Single request-response */
export type TRpcApi<T, U> = {
    request: TRpcRequestBody<T>;
    response: TRpcResponseBody<U>;
};

/**
 * @public
 */
export type TRpcApiMap = TGeneralRoutesMap &
    TStagesRoutesMap &
    TAuthRoutesMap &
    TTradingDataProviderRoutesMap &
    TInstrumentsRoutesMap &
    TAuthorizationRoutesMap &
    TUserSettingsRoutesMap &
    TTimeseriesRoutesMap &
    TDashboardStorageRoutesMap;

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
