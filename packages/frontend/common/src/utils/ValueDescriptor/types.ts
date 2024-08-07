import type { TraceId } from '@common/utils';

import type { TFail } from '../../types/Fail';
import type { EGrpcErrorCode } from '../../types/GrpcError';

export type TValueDescriptor2<SyncPayload, UnsyncPayload = never> =
    | TSyncedValueDescriptor<SyncPayload>
    | TUnsyncedValueDescriptor<UnsyncPayload>;

export enum EValueDescriptorState2 {
    Synced = 'Synced',
    Unsynced = 'Unsynced',
}

export type TSyncedValueDescriptor<P> = {
    state: EValueDescriptorState2.Synced;
    value: P;
    fail: null;
    meta: null;
};
export type TUnsyncedValueDescriptor<P = never> = {
    state: EValueDescriptorState2.Unsynced;
    value: null | P;
    fail: null | TGrpcFail;
    meta: null | TMetaState;
};

export enum EValueDescriptorPendingState {
    WaitingArguments = 'WaitingArguments',
    Requesting = 'Requesting',
    Receiving = 'Receiving',
}

export type TMetaState = {
    pendingState: null | EValueDescriptorPendingState;
    // Examples for future
    // retryState: boolean;
    // retryCount: number;
    // channelState: 'stable'|'unstable'|'disconnected'
    // channelSpeedState: 'fast'|'slow'|'unknown'
};

export type ExtractValueDescriptorPayload<T> = T extends TValueDescriptor2<infer A, infer B>
    ? A | B
    : never;

export type ExtractSyncedValueDescriptorPayload<T> = T extends TSyncedValueDescriptor<infer A>
    ? A
    : never;

export type ExtractUnsyncedValueDescriptorPayload<T> = T extends TUnsyncedValueDescriptor<infer A>
    ? A
    : never;

export type ExtractSyncedValueDescriptor<T extends TValueDescriptor2<any, any>> = Extract<
    T,
    { state: EValueDescriptorState2.Synced }
>;

export type ExtractUnsyncedValueDescriptor<T extends TValueDescriptor2<any, any>> = Extract<
    T,
    { state: EValueDescriptorState2.Unsynced }
>;

type TFailMeta = {
    message: string;
    description?: string;
    traceId?: TraceId;
};

export type TGrpcFail =
    | TFail<EGrpcErrorCode.CANCELLED, TFailMeta>
    | TFail<EGrpcErrorCode.UNKNOWN, TFailMeta>
    | TFail<EGrpcErrorCode.INVALID_ARGUMENT, TFailMeta>
    | TFail<EGrpcErrorCode.DEADLINE_EXCEEDED, TFailMeta>
    | TFail<EGrpcErrorCode.NOT_FOUND, TFailMeta>
    | TFail<EGrpcErrorCode.ALREADY_EXISTS, TFailMeta>
    | TFail<EGrpcErrorCode.PERMISSION_DENIED, TFailMeta>
    | TFail<EGrpcErrorCode.RESOURCE_EXHAUSTED, TFailMeta>
    | TFail<EGrpcErrorCode.FAILED_PRECONDITION, TFailMeta>
    | TFail<EGrpcErrorCode.ABORTED, TFailMeta>
    | TFail<EGrpcErrorCode.OUT_OF_RANGE, TFailMeta>
    | TFail<EGrpcErrorCode.UNIMPLEMENTED, TFailMeta>
    | TFail<EGrpcErrorCode.INTERNAL, TFailMeta>
    | TFail<EGrpcErrorCode.UNAVAILABLE, TFailMeta>
    | TFail<EGrpcErrorCode.DATA_LOSS, TFailMeta>
    | TFail<EGrpcErrorCode.UNAUTHENTICATED, TFailMeta>;
