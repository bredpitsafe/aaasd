import type { ISO } from '@common/types';
import type { TraceId } from '@common/utils';

import type { EGrpcErrorCode } from '../../types/GrpcError.ts';
import type {
    TStructurallyCloneable,
    TStructurallyCloneableObject,
} from '../../types/serialization';

export type WithState = {
    state: EHeaderState;
};
export type WithError<Error> = {
    error: Error;
};
export type WithPayload<Payload> = {
    payload: Payload;
};
export type TSendPayload = TStructurallyCloneable & { type: string };
export type WithSendPayload<Payload extends TSendPayload> = WithPayload<Payload>;

export enum EHeaderState {
    Done = 'Done',
    Aborted = 'Aborted',
    InProgress = 'InProgress',
    LimitReached = 'LimitReached',
}

export type THeader = {
    traceId: TraceId;
    correlationId: number;
    timestamp: ISO;
};
export type TReceiveError = {
    // BFF error do not have kind, they only have `code`
    kind?: string;
    description: string;
    // WAPI error do not have `code`, they only have `kind`
    code?: EGrpcErrorCode;
    args?: TStructurallyCloneableObject;
};
export type TEnvelope<Body> = THeader & Body;
export type TSendEnvelope<Payload extends TSendPayload> = TEnvelope<WithSendPayload<Payload>>;
export type TReceivedEnvelope<Payload> = WithState &
    TEnvelope<WithPayload<Payload> | WithError<TReceiveError>>;
export type TReceivedData<Payload> = TEnvelope<WithPayload<Payload>> & {
    state: EHeaderState;
};

export type ExtractReceivedDataPayload<T extends TReceivedData<any>> = T extends TReceivedData<
    infer P
>
    ? P
    : never;
