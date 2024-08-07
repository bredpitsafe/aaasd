import type { Observable } from 'rxjs';
import { concat, mergeMap, of, throwError, timer } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { EErrorReason } from '../../../lib/SocketStream/def';
import { SocketStreamError } from '../../../lib/SocketStream/SocketStreamError';
import { convertErrToGrpcFail } from '../../../utils/ValueDescriptor/Fails';
import type { TValueDescriptor2 } from '../../../utils/ValueDescriptor/types';
import { createUnsyncedValueDescriptor } from '../../../utils/ValueDescriptor/utils';
import type { TRequiredHandlerOptions } from '../def';

const UNSPECIFIED_RETRY_DELAY = 5_000;

export function retryOperator<T extends TValueDescriptor2<any>>(options: TRequiredHandlerOptions) {
    let _index = 0;
    return catchError<T, Observable<T>>((error: Error | SocketStreamError, caught) => {
        const index = _index++;
        const isCommunicatorError = error instanceof SocketStreamError;

        if (!isCommunicatorError) {
            return throwError(error);
        }

        const isRetryOnReconnect =
            options.retryOnReconnect && error.reason === EErrorReason.socketClose;
        const isRetryOnTimeout = index < options.retries && error.reason === EErrorReason.timeout;
        // retry unspecified error only once
        const isRetryOnUnspecified =
            isCommunicatorError && index === 0 && error.kind === 'Unspecified';

        if (isRetryOnUnspecified) {
            return concat(
                of(createUnsyncedValueDescriptor(convertErrToGrpcFail(error)) as T),
                timer(UNSPECIFIED_RETRY_DELAY).pipe(mergeMap(() => caught)),
            );
        }

        if (isRetryOnReconnect || isRetryOnTimeout) {
            return concat(
                of(createUnsyncedValueDescriptor(convertErrToGrpcFail(error)) as T),
                caught,
            );
        }

        return throwError(error);
    });
}
