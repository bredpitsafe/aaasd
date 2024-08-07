import { EErrorReason } from '@frontend/common/src/lib/SocketStream/def';
import { SocketStreamError } from '@frontend/common/src/lib/SocketStream/SocketStreamError';
import type { TRequiredHandlerOptions } from '@frontend/common/src/modules/communicationHandlers/def';
import { mergeMap, of, retryWhen, timer } from 'rxjs';

const UNSPECIFIED_RETRY_DELAY = 5_000;

export function retryOperator<T>(options: TRequiredHandlerOptions) {
    return retryWhen<T>((error$) => {
        return error$.pipe(
            mergeMap((error: Error | SocketStreamError, index) => {
                const isCommunicatorError = error instanceof SocketStreamError;
                if (!isCommunicatorError) {
                    throw error;
                }

                const isRetryOnReconnect =
                    options.retryOnReconnect && error.reason === EErrorReason.socketClose;
                const isRetryOnTimeout =
                    index < options.retries && error.reason === EErrorReason.timeout;
                // retry unspecified error only once
                const isRetryOnUnspecified =
                    isCommunicatorError && index === 0 && error.kind === 'Unspecified';

                if (isRetryOnUnspecified) {
                    return timer(UNSPECIFIED_RETRY_DELAY);
                }

                if (isRetryOnReconnect || isRetryOnTimeout) {
                    return of(true);
                }

                throw error;
            }),
        );
    });
}
