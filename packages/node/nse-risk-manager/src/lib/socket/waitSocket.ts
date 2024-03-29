import type { Socket } from '@frontend/common/src/lib/Socket/Socket';
import { EErrorReason } from '@frontend/common/src/lib/SocketStream/def';
import { SocketStreamError } from '@frontend/common/src/lib/SocketStream/SocketStreamError';
import { TRequiredHandlerOptions } from '@frontend/common/src/modules/communicationHandlers/def';
import { EGrpcErrorCode } from '@frontend/common/src/types/GrpcError';
import { first, interval, mapTo, Observable, timeout } from 'rxjs';

export function waitSocket$(socket: Socket, options: TRequiredHandlerOptions): Observable<Socket> {
    return interval(1000).pipe(
        first(() => socket.isOpened()),
        timeout({
            first: options.timeout,
            with: () => {
                throw new SocketStreamError(
                    `Socket(${socket.url}) open(${socket.getReadyState()}) timeout`,
                    {
                        code: EGrpcErrorCode.UNKNOWN,
                        reason: EErrorReason.timeout,
                        traceId: options.traceId,
                        correlationId: NaN,
                    },
                );
            },
        }),
        mapTo(socket),
    );
}
