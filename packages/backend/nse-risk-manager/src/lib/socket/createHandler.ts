import { generateTraceId } from '@common/utils';
import { BFFSocket } from '@frontend/common/src/lib/BFFSocket/BFFSocket';
import type { TSendEnvelope } from '@frontend/common/src/lib/BFFSocket/def';
import { createSocketStream } from '@frontend/common/src/lib/SocketStream';
import type { TUnsubscribe } from '@frontend/common/src/modules/actions/def';
import type {
    TRequiredHandlerOptions,
    TStreamHandler,
} from '@frontend/common/src/modules/communicationHandlers/def';
import { logErrorOperator } from '@frontend/common/src/modules/communicationHandlers/operators/logError';
import { timeoutOperator } from '@frontend/common/src/modules/communicationHandlers/operators/timeoutOperator';
import {
    createEnvelope,
    generateCorrelationId,
} from '@frontend/common/src/modules/communicationHandlers/utils';
import type { TSocketURL } from '@frontend/common/src/types/domain/sockets';
import { isSyncedValueDescriptor } from '@frontend/common/src/utils/ValueDescriptor/utils';
import { identity, switchMap } from 'rxjs';
import { filter, map } from 'rxjs/operators';

import { authenticateSocket } from './authenticateSocket';
import { releaseSocket } from './releaseSocket';
import { retryOperator } from './retryOperator';
import { waitSocket$ } from './waitSocket';

export const createHandler = (): TStreamHandler => {
    return <TStreamHandler>((url: TSocketURL, _sender, _options) => {
        const options: TRequiredHandlerOptions = {
            enableLogs: _options?.enableLogs ?? false,
            retries: _options?.retries ?? 0,
            retryOnReconnect: _options?.retryOnReconnect ?? false,
            timeout: _options?.timeout ?? 10_000,
            waitForResponse: _options?.waitForResponse ?? true,
            traceId: _options?.traceId ?? generateTraceId(),
            skipAuthentication: _options?.skipAuthentication ?? false,
            enableRetries: _options?.enableRetries ?? false,
        };

        const correlationId = generateCorrelationId();
        const [request, closeBody] = _sender().map((body) =>
            createEnvelope(body, options.traceId, correlationId),
        );

        const socket = new BFFSocket(new URL(url));

        return waitSocket$(socket, options).pipe(
            // Authenticate socket
            switchMap(authenticateSocket(socket, options)),
            // Send actual request
            switchMap(() =>
                createSocketStream(
                    socket,
                    request,
                    closeBody as TSendEnvelope<TUnsubscribe>,
                    options,
                ),
            ),
            filter(isSyncedValueDescriptor),
            map((v) => v.value),
            options.waitForResponse
                ? timeoutOperator(socket.url.pathname as TSocketURL, request, options)
                : identity,
            options.enableLogs ? logErrorOperator(request) : identity,
            retryOperator(options),
            releaseSocket(socket),
        );
    });
};
