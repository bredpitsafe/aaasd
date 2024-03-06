import { Observable, timeout } from 'rxjs';

import { TSendEnvelope } from '../../../lib/BFFSocket/def';
import { EErrorReason } from '../../../lib/SocketStream/def';
import { SocketStreamError } from '../../../lib/SocketStream/SocketStreamError';
import { EGrpcErrorCode } from '../../../types/GrpcError';
import { TRequiredHandlerOptions } from '../def';

export function timeoutOperator<T>(envelope: TSendEnvelope<any>, options: TRequiredHandlerOptions) {
    return timeout<T, Observable<T>>({
        first: options.timeout,
        with: () => {
            throw new SocketStreamError('Server message receive timeout', {
                code: EGrpcErrorCode.UNKNOWN,
                reason: EErrorReason.timeout,
                traceId: envelope.traceId,
                correlationId: envelope.correlationId,
            });
        },
    });
}
