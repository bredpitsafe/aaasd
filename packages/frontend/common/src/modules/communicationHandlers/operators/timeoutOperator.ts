import type { Observable } from 'rxjs';
import { timeout } from 'rxjs';

import type { TSendEnvelope } from '../../../lib/BFFSocket/def';
import { EErrorReason } from '../../../lib/SocketStream/def';
import { SocketStreamError } from '../../../lib/SocketStream/SocketStreamError';
import type { TSocketURL } from '../../../types/domain/sockets.ts';
import { EGrpcErrorCode } from '../../../types/GrpcError';
import type { TRequiredHandlerOptions } from '../def';

export function timeoutOperator<T>(
    url: TSocketURL,
    envelope: TSendEnvelope<any>,
    options: TRequiredHandlerOptions,
) {
    return timeout<T, Observable<T>>({
        first: options.timeout,
        with: () => {
            throw new SocketStreamError('Server message receive timeout', {
                code: EGrpcErrorCode.UNKNOWN,
                reason: EErrorReason.timeout,
                traceId: envelope.traceId,
                correlationId: envelope.correlationId,
                socketURL: url,
            });
        },
    });
}
