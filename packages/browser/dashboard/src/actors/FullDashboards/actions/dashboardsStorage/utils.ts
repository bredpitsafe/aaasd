import { SocketStreamError } from '@frontend/common/src/lib/SocketStream/SocketStreamError';
import { EStorageDashboardErrorType } from '@frontend/common/src/types/domain/dashboardsStorage';
import type { TFailConstructor } from '@frontend/common/src/types/Fail';
import { Fail } from '@frontend/common/src/types/Fail';
import { EGrpcErrorCode, GrpcError } from '@frontend/common/src/types/GrpcError';
import type { ValueDescriptor } from '@frontend/common/src/types/ValueDescriptor';
import { tapError } from '@frontend/common/src/utils/Rx/tap';
import { logger, TLogger } from '@frontend/common/src/utils/Tracing';
import { FailDesc } from '@frontend/common/src/utils/ValueDescriptor';
import { convertErrToGrpcFail } from '@frontend/common/src/utils/ValueDescriptor/Fails';
import { TValueDescriptor2 } from '@frontend/common/src/utils/ValueDescriptor/types';
import { createUnsyncedValueDescriptor } from '@frontend/common/src/utils/ValueDescriptor/utils';
import { isEmpty } from 'lodash-es';
import type { MonoTypeOperatorFunction, Observable } from 'rxjs';
import { concat, of, timer } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';

import type { TCommonFailDesc, TDashboardActionFailDesc } from '../../types';
import { RESTART_FAILED_SUBSCRIPTION_TIMEOUT } from './defs';

export function logError<T>(
    scope: string,
    title: string,
    errorLogger: TLogger = logger,
): MonoTypeOperatorFunction<T> {
    return tapError((error) => {
        if (error instanceof SocketStreamError) {
            const description = error.getDescription();

            errorLogger.error(
                `[${scope}] ${title}: ${error.message}${
                    isEmpty(description) ? '' : ` ${description}`
                }`,
                {
                    traceId: error.traceId,
                    correlationId: error.correlationId,
                    kind: error.kind,
                    reason: error.reason,
                    timestamp: error.timestamp,
                },
            );

            return;
        }

        logger.error(`[${scope}] ${title}: ${error.message}`);
    });
}

/**
 * @deprecated
 */
export function convertErrorToCommonFailDesc<S extends Exclude<string, ''>, T, P = null>(
    createFail: TFailConstructor<S>,
): MonoTypeOperatorFunction<ValueDescriptor<T, TCommonFailDesc<S>, P>> {
    return catchError((error) => {
        if (!(error instanceof SocketStreamError)) {
            return of(
                FailDesc(createFail('UNKNOWN', error.message)) as ValueDescriptor<
                    T,
                    TCommonFailDesc<S>,
                    P
                >,
            );
        }

        return of(
            FailDesc(
                createFail('SERVER_NOT_PROCESSED', {
                    kind: error.kind,
                    message: error.message,
                    description: error.getDescription(),
                    traceId: error.traceId,
                }),
            ) as ValueDescriptor<T, TCommonFailDesc<S>, P>,
        );
    });
}

/**
 * @deprecated
 */
export function convertErrorToDashboardActionFailDesc<S extends Exclude<string, ''>, T, P = null>(
    createFail: TFailConstructor<S>,
): MonoTypeOperatorFunction<ValueDescriptor<T, TDashboardActionFailDesc<S>, P>> {
    return catchError((error) => {
        if (!(error instanceof SocketStreamError)) {
            return of(
                FailDesc(createFail('UNKNOWN', error.message)) as ValueDescriptor<
                    T,
                    TDashboardActionFailDesc<S>,
                    P
                >,
            );
        }

        switch (error.kind) {
            case EStorageDashboardErrorType.Validation:
                return of(
                    FailDesc(
                        createFail('NOT_FOUND', {
                            message: error.message,
                            description: error.getDescription(),
                            traceId: error.traceId,
                        }),
                    ) as ValueDescriptor<T, TDashboardActionFailDesc<S>, P>,
                );
            case EStorageDashboardErrorType.Authorization:
                return of(
                    FailDesc(
                        createFail('AUTHORIZATION', {
                            message: error.message,
                            description: error.getDescription(),
                            traceId: error.traceId,
                        }),
                    ) as ValueDescriptor<T, TDashboardActionFailDesc<S>, P>,
                );
            default:
                return of(
                    FailDesc(
                        createFail('SERVER_NOT_PROCESSED', {
                            kind: error.kind,
                            message: error.message,
                            description: error.getDescription(),
                            traceId: error.traceId,
                        }),
                    ) as ValueDescriptor<T, TDashboardActionFailDesc<S>, P>,
                );
        }
    });
}

/**
 * @deprecated
 */
export function retryWithCommonFails<S extends Exclude<string, ''>, T, P = null>(
    createDescFail: TFailConstructor<S>,
    retryTimeout = RESTART_FAILED_SUBSCRIPTION_TIMEOUT,
): MonoTypeOperatorFunction<ValueDescriptor<T, TDashboardActionFailDesc<S>, P>> {
    const createFail = (error: Error) => {
        if (!(error instanceof SocketStreamError)) {
            return createDescFail('UNKNOWN', error.message);
        }

        switch (error.kind) {
            case EStorageDashboardErrorType.Validation:
                return createDescFail('NOT_FOUND', {
                    message: error.message,
                    description: error.getDescription(),
                    traceId: error.traceId,
                });
            case EStorageDashboardErrorType.Authorization:
                return createDescFail('AUTHORIZATION', {
                    message: error.message,
                    description: error.getDescription(),
                    traceId: error.traceId,
                });
            default:
                return createDescFail('SERVER_NOT_PROCESSED', {
                    kind: error.kind,
                    message: error.message,
                    description: error.getDescription(),
                    traceId: error.traceId,
                });
        }
    };

    return catchError(
        (error: Error, caught: Observable<ValueDescriptor<T, TDashboardActionFailDesc<S>, P>>) => {
            const failResponse = of(
                FailDesc(createFail(error)) as ValueDescriptor<T, TDashboardActionFailDesc<S>, P>,
            );

            if (
                !(error instanceof SocketStreamError) ||
                error.kind === EStorageDashboardErrorType.Authorization ||
                error.kind === EStorageDashboardErrorType.Validation
            ) {
                return failResponse;
            }

            return concat(failResponse, timer(retryTimeout).pipe(switchMap(() => caught)));
        },
    );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function retryWithCommonFails2<T extends TValueDescriptor2<any>>(
    retryTimeout = RESTART_FAILED_SUBSCRIPTION_TIMEOUT,
): MonoTypeOperatorFunction<T> {
    const createFail = (error: Error) => {
        if (error instanceof GrpcError) {
            return convertErrToGrpcFail(error);
        }

        if (error instanceof SocketStreamError) {
            switch (error.kind) {
                case EStorageDashboardErrorType.Validation:
                    return Fail(EGrpcErrorCode.NOT_FOUND, {
                        message: error.message,
                        description: error.getDescription(),
                        traceId: error.traceId,
                    });
                case EStorageDashboardErrorType.Authorization:
                    return Fail(EGrpcErrorCode.PERMISSION_DENIED, {
                        message: error.message,
                        description: error.getDescription(),
                        traceId: error.traceId,
                    });
                default:
                    return Fail(EGrpcErrorCode.UNKNOWN, {
                        kind: error.kind,
                        message: error.message,
                        description: error.getDescription(),
                        traceId: error.traceId,
                    });
            }
        }

        return Fail(EGrpcErrorCode.UNKNOWN, { message: error.message });
    };

    return catchError((error: Error, caught: Observable<T>) => {
        const failResponse = of(createUnsyncedValueDescriptor(createFail(error)) as T);

        if (
            !(error instanceof SocketStreamError) ||
            error.kind === EStorageDashboardErrorType.Authorization ||
            error.kind === EStorageDashboardErrorType.Validation
        ) {
            return failResponse;
        }

        return concat(failResponse, timer(retryTimeout).pipe(switchMap(() => caught)));
    });
}

/**
 * @deprecated
 */
export function retryWithDashboardActionFails<S extends Exclude<string, ''>, T, P = null>(
    createDescFail: TFailConstructor<S>,
    retryTimeout = RESTART_FAILED_SUBSCRIPTION_TIMEOUT,
): MonoTypeOperatorFunction<ValueDescriptor<T, TCommonFailDesc<S>, P>> {
    const createFail = (error: Error) => {
        if (!(error instanceof SocketStreamError)) {
            return createDescFail('UNKNOWN', error.message);
        }

        return createDescFail('SERVER_NOT_PROCESSED', {
            kind: error.kind,
            message: error.message,
            description: error.getDescription(),
            traceId: error.traceId,
        });
    };

    return catchError(
        (error: Error, caught: Observable<ValueDescriptor<T, TCommonFailDesc<S>, P>>) => {
            const failResponse = of(
                FailDesc(createFail(error)) as ValueDescriptor<T, TCommonFailDesc<S>, P>,
            );

            if (!(error instanceof SocketStreamError)) {
                return failResponse;
            }

            return concat(failResponse, timer(retryTimeout).pipe(switchMap(() => caught)));
        },
    );
}
