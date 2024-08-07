import { SocketStreamError } from '@frontend/common/src/lib/SocketStream/SocketStreamError';
import { EStorageDashboardErrorType } from '@frontend/common/src/types/domain/dashboardsStorage';
import {
    convertErrToGrpcError,
    EGrpcErrorCode,
    GrpcError,
} from '@frontend/common/src/types/GrpcError';
import { throwingError } from '@frontend/common/src/utils/throwingError.ts';
import type { MonoTypeOperatorFunction } from 'rxjs';
import { catchError } from 'rxjs/operators';

export function convertDashboardStorageErrorToGrpcError<T>(): MonoTypeOperatorFunction<T> {
    return catchError((error) => {
        if (!(error instanceof SocketStreamError)) {
            return throwingError(convertErrToGrpcError(error));
        }

        switch (error.kind) {
            case EStorageDashboardErrorType.Validation:
                return throwingError(
                    new GrpcError(error.message, {
                        code: EGrpcErrorCode.NOT_FOUND,
                        description: error.description,
                        traceId: error.traceId,
                    }),
                );
            case EStorageDashboardErrorType.Authorization:
                return throwingError(
                    new GrpcError(error.message, {
                        code: EGrpcErrorCode.UNAUTHENTICATED,
                        description: error.description,
                        traceId: error.traceId,
                    }),
                );
            default:
                return throwingError(error);
        }
    });
}
