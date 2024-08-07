import { Fail } from '@frontend/common/src/types/Fail';
import { EGrpcErrorCode } from '@frontend/common/src/types/GrpcError.ts';
import type { TGrpcFail } from '@frontend/common/src/utils/ValueDescriptor/types.ts';

export function createCustomViewEmptyFail(message: string, description?: string): TGrpcFail {
    return Fail(EGrpcErrorCode.FAILED_PRECONDITION, {
        message,
        description,
    });
}

export function createCustomViewParseError(message: string, description?: string): TGrpcFail {
    return Fail(EGrpcErrorCode.INVALID_ARGUMENT, {
        message,
        description,
    });
}
