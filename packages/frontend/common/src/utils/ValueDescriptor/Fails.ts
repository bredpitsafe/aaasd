// reuse grpc errors https://developers.google.com/actions-center/reference/grpc-api/status_codes
import { Fail } from '../../types/Fail';
import { EGrpcErrorCode, GrpcError } from '../../types/GrpcError';
import type { TGrpcFail } from './types';

export function convertErrToGrpcFail(err: Error | GrpcError): TGrpcFail {
    return Fail(err instanceof GrpcError ? err.code : EGrpcErrorCode.UNKNOWN, {
        message: err.message,
        description: 'description' in err ? err.description : undefined,
        traceId: 'traceId' in err ? err.traceId : undefined,
    });
}

export function convertGrpcFailToGrpcError(fail: TGrpcFail): GrpcError {
    return new GrpcError(fail.meta.message, {
        code: fail.code,
        description: fail.meta.description,
        traceId: fail.meta.traceId,
    });
}

export function isCriticalFail({ code }: TGrpcFail) {
    return mapGrpcCodeToWeight[code] >= mapGrpcCodeToWeight[EGrpcErrorCode.FAILED_PRECONDITION];
}

export function findWorstFailIndex(fails: TGrpcFail[]): number {
    return fails.reduce((worstIndex, fail, index) => {
        return mapGrpcCodeToWeight[fail.code] > mapGrpcCodeToWeight[fails[worstIndex].code]
            ? index
            : worstIndex;
    }, 0);
}

export const mapGrpcCodeToWeight = {
    [EGrpcErrorCode.UNAUTHENTICATED]: 16,
    [EGrpcErrorCode.PERMISSION_DENIED]: 15,
    [EGrpcErrorCode.DATA_LOSS]: 14,
    [EGrpcErrorCode.ABORTED]: 13,
    [EGrpcErrorCode.FAILED_PRECONDITION]: 12,
    [EGrpcErrorCode.UNKNOWN]: 11,
    [EGrpcErrorCode.INTERNAL]: 10,
    [EGrpcErrorCode.UNAVAILABLE]: 9,
    [EGrpcErrorCode.NOT_FOUND]: 8,
    [EGrpcErrorCode.OUT_OF_RANGE]: 7,
    [EGrpcErrorCode.UNIMPLEMENTED]: 6,
    [EGrpcErrorCode.INVALID_ARGUMENT]: 5,
    [EGrpcErrorCode.DEADLINE_EXCEEDED]: 4,
    [EGrpcErrorCode.RESOURCE_EXHAUSTED]: 3,
    [EGrpcErrorCode.ALREADY_EXISTS]: 2,
    [EGrpcErrorCode.CANCELLED]: 1,
};
