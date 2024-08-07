import type { Socket } from '@frontend/common/src/lib/Socket/Socket';
import { EErrorReason } from '@frontend/common/src/lib/SocketStream/def';
import { SocketStreamError } from '@frontend/common/src/lib/SocketStream/SocketStreamError';
import type { TRequiredHandlerOptions } from '@frontend/common/src/modules/communicationHandlers/def';
import type { TSocketURL } from '@frontend/common/src/types/domain/sockets';
import { EGrpcErrorCode } from '@frontend/common/src/types/GrpcError';
import type { Observable } from 'rxjs';
import { first, interval, mapTo, timeout } from 'rxjs';

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
                        socketURL: socket.url.pathname as TSocketURL,
                    },
                );
            },
        }),
        mapTo(socket),
    );
}
