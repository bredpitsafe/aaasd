import { EMPTY, fromEvent, merge, of, Subject } from 'rxjs';
import { distinctUntilChanged, filter, map, switchMap, takeUntil, tap } from 'rxjs/operators';

import {
    ESocketAuthenticationState,
    setAuthenticationSocketState,
} from '../../../modules/authentication/data';
import { createEnvelope } from '../../../modules/communicationHandlers/utils';
import { getSessionToken$ } from '../../../modules/session';
import { isFail } from '../../../types/Fail';
import { Seconds } from '../../../types/time';
import { hashString } from '../../../utils/hashString';
import { getExpiryTimeDifference } from '../../../utils/keycloak';
import { logger } from '../../../utils/Tracing';
import { loggerAuth } from '../../../utils/Tracing/Children/auth';
import { ISocketPlugin } from '../../Socket/def';
import { BFFSocket } from '../BFFSocket';
import {
    THeader,
    TReceivedEnvelope,
    TReceiveError,
    WithError,
    WithPayload,
    WithState,
} from '../def';

const MIN_TOKEN_EXP_TO_UPDATE = 30 as Seconds;

enum EAuthenticationRequestType {
    Authenticate = 'Authenticate',
}

enum EAuthenticationResponseType {
    Authenticated = 'Authenticated',
    AuthenticationNotRequired = 'AuthenticationNotRequired',
}

const SUCCESS_AUTH_TYPES = Object.values(EAuthenticationResponseType);

type TAuthenticationResponse = { type: EAuthenticationResponseType };

type TErrorEnvelope = THeader & WithState & WithError<TReceiveError>;

export type TAuthenticationPluginCallbacks = {
    setAuthenticationSocketState: typeof setAuthenticationSocketState;
    onError: (err: WithError<TReceiveError>) => void;
};

export class AuthenticationPlugin implements ISocketPlugin {
    private destroyer$ = new Subject<void>();

    constructor(private callbacks: TAuthenticationPluginCallbacks) {}

    connect(host: BFFSocket): void {
        const { setAuthenticationSocketState, onError } = this.callbacks;

        const open$ = merge(
            fromEvent(host, 'open', (event) => event as Event).pipe(map(() => host)),
            host.isOpened() ? of(host) : EMPTY,
        );

        const close$ = merge(
            fromEvent(host, 'closing', (event) => event as CloseEvent),
            fromEvent(host, 'close', (event) => event as CloseEvent),
        );

        const authSuccess$ = fromEvent(
            host,
            'envelope',
            (envelope) => envelope as TReceivedEnvelope<TAuthenticationResponse>,
        ).pipe(
            filter((envelope) => {
                return isPayload(envelope) && SUCCESS_AUTH_TYPES.includes(envelope.payload.type);
            }),
        );

        const authError$ = fromEvent(
            host,
            'envelope',
            (envelope) => envelope as TReceivedEnvelope<TAuthenticationResponse>,
        ).pipe(
            filter((envelope): envelope is TErrorEnvelope => {
                return isError(envelope) && envelope.error.kind === 'Auth';
            }),
        );

        const startAuthProcess$ = (host: BFFSocket) =>
            getSessionToken$().pipe(
                filter((maybeToken): maybeToken is string => typeof maybeToken === 'string'),
                distinctUntilChanged((oldToken, token) => {
                    const expTimeDiff = getExpiryTimeDifference(token, oldToken);

                    // Either token or oldToken might be invalid, but we don't handle this case here
                    if (isFail(expTimeDiff)) {
                        loggerAuth.error('Invalid token during update attempt');
                        return false;
                    }

                    return expTimeDiff < MIN_TOKEN_EXP_TO_UPDATE;
                }),
                tap((token) => {
                    loggerAuth.debug(`Send auth token with hash "${hashString(token)}" to socket`);
                    setAuthenticationSocketState(host, ESocketAuthenticationState.Authenticating);
                    host.send(
                        createEnvelope({
                            type: EAuthenticationRequestType.Authenticate,
                            bearerToken: token,
                        }),
                    );
                }),
                takeUntil(close$),
            );

        open$.pipe(switchMap(startAuthProcess$), takeUntil(this.destroyer$)).subscribe();

        authSuccess$.pipe(takeUntil(this.destroyer$)).subscribe(() => {
            // Received Auth success from socket, socket is authenticated
            setAuthenticationSocketState(host, ESocketAuthenticationState.Authenticated);
        });

        authError$.pipe(takeUntil(this.destroyer$)).subscribe((envelope) => {
            // Received Auth error from socket, socket is not authenticated anymore
            setAuthenticationSocketState(host, ESocketAuthenticationState.Failed);
            onError(envelope);
            logger.error(
                `[SocketAuthenticationPlugin] Authentication error from socket`,
                envelope.error,
            );
        });

        close$.pipe(takeUntil(this.destroyer$)).subscribe(() => {
            setAuthenticationSocketState(host, ESocketAuthenticationState.NotAuthenticated);
        });
    }

    disconnect(host: BFFSocket): void {
        const { setAuthenticationSocketState } = this.callbacks;

        setAuthenticationSocketState(host, ESocketAuthenticationState.NotAuthenticated);

        this.destroyer$.next();
        this.destroyer$.complete();
    }
}

function isError(
    envelope: TReceivedEnvelope<TAuthenticationResponse>,
): envelope is THeader & WithState & WithError<TReceiveError> {
    return 'error' in envelope;
}
function isPayload(
    envelope: TReceivedEnvelope<TAuthenticationResponse>,
): envelope is THeader & WithState & WithPayload<TAuthenticationResponse> {
    return 'payload' in envelope;
}
