import { isNil } from 'lodash-es';
import type { Observable } from 'rxjs';
import { forkJoin, mergeMap, NEVER, of, switchMap, timeout, timer } from 'rxjs';
import { first, map } from 'rxjs/operators';

import type { BFFSocket } from '../../../lib/BFFSocket/BFFSocket';
import {
    AuthenticationPlugin,
    ESocketAuthenticationState,
} from '../../../lib/BFFSocket/plugins/AuthenticationPlugin.ts';
import { EWebSocketReadyState } from '../../../lib/Socket/Socket.ts';
import { EErrorReason } from '../../../lib/SocketStream/def';
import { SocketStreamError } from '../../../lib/SocketStream/SocketStreamError';
import type { TSocketURL } from '../../../types/domain/sockets.ts';
import { EGrpcErrorCode } from '../../../types/GrpcError';
import { throwingError } from '../../../utils/throwingError.ts';
import { networkStatus } from '../../networkStatus';
import type { TRequiredHandlerOptions } from '../def';

export function waitSocket$(
    socket: BFFSocket,
    options: TRequiredHandlerOptions,
): Observable<BFFSocket> {
    return forkJoin([
        // Wait for actual network connectivity to host domain before starting timeouts
        // If the host connectivity is compromised, spamming timeout errors from every subscription it not necessary
        networkStatus.online$.pipe(
            first((online) => online),
            switchMap(() =>
                timer(0, 1000).pipe(
                    first(() => socket.isOpened()),
                    timeout({
                        first: options.timeout,
                        with: () => {
                            throw getSocketTimeoutError(socket, options);
                        },
                    }),
                ),
            ),
        ),
        options.skipAuthentication === true
            ? of(true)
            : getAuthPlugin(socket).pipe(
                  mergeMap((plugin) =>
                      plugin.state$.pipe(
                          switchMap(({ state, error }) => {
                              switch (state) {
                                  case ESocketAuthenticationState.Authenticated: {
                                      return of(true);
                                  }
                                  // `NotAuthenticated` is not an error, socket is simply not authenticated yet
                                  // (but it may be later, just wait)
                                  case ESocketAuthenticationState.NotAuthenticated: {
                                      return NEVER;
                                  }
                                  case ESocketAuthenticationState.Authenticating: {
                                      return timer(options.timeout).pipe(
                                          map(() => {
                                              throw new SocketStreamError(
                                                  'Socket authentication timeout',
                                                  {
                                                      code: EGrpcErrorCode.ABORTED,
                                                      reason: EErrorReason.authentication,
                                                      traceId: options.traceId,
                                                      socketURL: socket.url.pathname as TSocketURL,
                                                  },
                                              );
                                          }),
                                      );
                                  }
                                  case ESocketAuthenticationState.Failed: {
                                      throw new SocketStreamError('Socket authentication failed', {
                                          code: error?.code ?? EGrpcErrorCode.UNKNOWN,
                                          description: error?.description,
                                          reason: EErrorReason.authentication,
                                          traceId: options.traceId,
                                          socketURL: socket.url.pathname as TSocketURL,
                                          args: error?.args,
                                      });
                                  }
                              }
                          }),
                          first(),
                      ),
                  ),
              ),
    ]).pipe(map(() => socket));
}

function getAuthPlugin(socket: BFFSocket): Observable<AuthenticationPlugin> {
    return of(
        socket.getPlugin<AuthenticationPlugin>(
            (plugin): plugin is AuthenticationPlugin => plugin instanceof AuthenticationPlugin,
        ),
    ).pipe(
        map((plugin) => {
            return isNil(plugin)
                ? throwingError(new Error('AuthenticationPlugin not found in socket plugins'))
                : plugin;
        }),
    );
}

function getSocketTimeoutError(
    socket: BFFSocket,
    options: TRequiredHandlerOptions,
): SocketStreamError {
    const message = `Failed to open socket '${socket.name}'`;
    let socketState = '';
    switch (socket.getReadyState()) {
        case EWebSocketReadyState.CONNECTING: {
            socketState = 'Socket has been created. The connection is not yet open';
        }
        case EWebSocketReadyState.OPEN: {
            socketState = 'Socket is open and ready to communicate';
        }
        case EWebSocketReadyState.CLOSING: {
            socketState = 'Socket is in the process of closing';
        }
        case EWebSocketReadyState.CLOSED: {
            socketState = "Socket is closed or couldn't be opened";
        }
    }

    const description = `${socketState}. Timed out after ${options.timeout}ms.`;
    return new SocketStreamError(message, {
        description,
        code: EGrpcErrorCode.CANCELLED,
        reason: EErrorReason.timeout,
        traceId: options.traceId,
        correlationId: NaN,
        socketURL: socket.url.pathname as TSocketURL,
    });
}
