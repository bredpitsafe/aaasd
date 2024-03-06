import {
    forkJoin,
    interval,
    mapTo,
    NEVER,
    Observable,
    of,
    switchMap,
    throwError,
    timeout,
    timer,
} from 'rxjs';
import { first, map } from 'rxjs/operators';

import { BFFSocket } from '../../../lib/BFFSocket/BFFSocket';
import { EErrorReason } from '../../../lib/SocketStream/def';
import { SocketStreamError } from '../../../lib/SocketStream/SocketStreamError';
import { EGrpcErrorCode } from '../../../types/GrpcError';
import type { IModuleAuthentication } from '../../authentication';
import { ESocketAuthenticationState } from '../../authentication/data';
import { TRequiredHandlerOptions } from '../def';

export function waitSocket$(
    socket: BFFSocket,
    isAuthenticatedSocket$: IModuleAuthentication['isAuthenticatedSocket$'],
    options: TRequiredHandlerOptions,
): Observable<BFFSocket> {
    return forkJoin([
        interval(1000).pipe(
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
        ),
        options.skipAuthentication === true
            ? of(true)
            : isAuthenticatedSocket$(socket).pipe(
                  switchMap((state) => {
                      switch (state) {
                          case ESocketAuthenticationState.NotAuthenticated: {
                              return NEVER;
                          }
                          case ESocketAuthenticationState.Authenticating: {
                              return timer(options.timeout).pipe(
                                  map(() =>
                                      throwError(
                                          new SocketStreamError('Socket authentication timeout', {
                                              code: EGrpcErrorCode.UNKNOWN,
                                              reason: EErrorReason.authentication,
                                              traceId: options.traceId,
                                          }),
                                      ),
                                  ),
                              );
                          }
                          case ESocketAuthenticationState.Authenticated: {
                              return of(true);
                          }
                          case ESocketAuthenticationState.Failed: {
                              throw new SocketStreamError('Socket authentication failed', {
                                  code: EGrpcErrorCode.UNKNOWN,
                                  reason: EErrorReason.authentication,
                                  traceId: options.traceId,
                              });
                          }
                      }
                  }),
                  first(),
              ),
    ]).pipe(mapTo(socket));
}
