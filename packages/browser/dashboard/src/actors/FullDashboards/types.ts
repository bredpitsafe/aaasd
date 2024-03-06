import type { TScopedFail } from '@frontend/common/src/types/Fail';
import type { TraceId } from '@frontend/common/src/utils/traceId';

export type TWithTraceId<T, K extends string> = {
    traceId: TraceId;
} & Record<K, T>;

type TUnknownFail<S extends Exclude<string, ''>> = TScopedFail<S, 'UNKNOWN', string>;
type TNotFoundFail<S extends Exclude<string, ''>> = TScopedFail<
    S,
    'NOT_FOUND',
    {
        message: string;
        description: string | undefined;
        traceId: TraceId;
    }
>;
type TAuthorizationFail<S extends Exclude<string, ''>> = TScopedFail<
    S,
    'AUTHORIZATION',
    {
        message: string;
        description: string | undefined;
        traceId: TraceId;
    }
>;
type TServerProcessFail<S extends Exclude<string, ''>> = TScopedFail<
    S,
    'SERVER_NOT_PROCESSED',
    {
        kind: string | undefined;
        message: string;
        description: string | undefined;
        traceId: TraceId;
    }
>;

export type TCommonFailDesc<S extends Exclude<string, ''>> =
    | TUnknownFail<S>
    | TServerProcessFail<S>;

export type TDashboardActionFailDesc<S extends Exclude<string, ''>> =
    | TCommonFailDesc<S>
    | TNotFoundFail<S>
    | TAuthorizationFail<S>;
