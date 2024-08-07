import { isEqual } from 'lodash-es';
import type { Logger } from 'pino';
import type { Observable } from 'rxjs';
import { EMPTY, endWith, fromEvent, merge, of, ReplaySubject, Subject } from 'rxjs';
import {
    distinctUntilChanged,
    filter,
    map,
    shareReplay,
    switchMap,
    takeUntil,
    tap,
} from 'rxjs/operators';

import { createEnvelope } from '../../../modules/communicationHandlers/utils';
import type { TSocketName } from '../../../types/domain/sockets.ts';
import { EGrpcErrorCode } from '../../../types/GrpcError.ts';
import { logger } from '../../../utils/Tracing';
import { Binding } from '../../../utils/Tracing/Children/Binding.ts';
import type { ISocketPlugin } from '../../Socket/def';
import type { BFFSocket } from '../BFFSocket';
import type {
    THeader,
    TReceivedEnvelope,
    TReceiveError,
    WithError,
    WithPayload,
    WithState,
} from '../def';

export enum ESocketAuthenticationState {
    NotAuthenticated = 'NotAuthenticated',
    Authenticating = 'Authenticating',
    Authenticated = 'Authenticated',
    Failed = 'Failed',
}

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

type TSocketAuthenticationState = {
    state: ESocketAuthenticationState;
    error?: TReceiveError;
};

export type TAuthenticationPluginCallbacks = {
    subscribeToSessionToken: (socketName: TSocketName) => Observable<null | string>;
    onError: (socketName: TSocketName, err: WithError<TReceiveError>) => void;
};

export class AuthenticationPlugin implements ISocketPlugin {
    private host$ = new ReplaySubject<BFFSocket>();
    private destroyer$ = new Subject<void>();
    private logger: Logger;

    constructor(private callbacks: TAuthenticationPluginCallbacks) {
        this.logger = logger.child(new Binding('AuthPlugin'));
    }

    state$ = this.host$.pipe(
        switchMap((host) => this.subscribeToState(host)),
        shareReplay(1),
    );

    connect(host: BFFSocket): void {
        this.host$.next(host);
    }

    disconnect(): void {
        logger.trace(`disconnect`);
        this.destroyer$.next();
        this.destroyer$.complete();
    }

    private subscribeToState(host: BFFSocket): Observable<TSocketAuthenticationState> {
        const { onError } = this.callbacks;
        const logger = this.logger.child(new Binding(host.name));
        logger.trace('new host');

        const open$ = merge(
            fromEvent(host, 'open', (event) => event as Event).pipe(
                tap(() => logger.trace('open')),
                map(() => host),
            ),
            host.isOpened() ? of(host) : EMPTY,
        );

        const close$ = merge(
            fromEvent(host, 'closing', (event) => event as CloseEvent),
            fromEvent(host, 'close', (event) => event as CloseEvent),
        ).pipe(tap(() => logger.trace('close')));

        const authSuccess$: Observable<TSocketAuthenticationState> = fromEvent(
            host,
            'envelope',
            (envelope) => envelope as TReceivedEnvelope<TAuthenticationResponse>,
        ).pipe(
            filter((envelope) => {
                return isPayload(envelope) && SUCCESS_AUTH_TYPES.includes(envelope.payload.type);
            }),
            map(() => ({ state: ESocketAuthenticationState.Authenticated })),
            tap(() => logger.info('auth success')),
        );

        const authError$: Observable<TSocketAuthenticationState> = fromEvent(
            host,
            'envelope',
            (envelope) => envelope as TReceivedEnvelope<TAuthenticationResponse>,
        ).pipe(
            filter((envelope): envelope is TErrorEnvelope => {
                return (
                    isError(envelope) &&
                    // envelope.error.kind === 'Auth' - WAPI error
                    // envelope.error.code === EGrpcErrorCode.UNAUTHENTICATED - BFF error
                    (envelope.error.kind === 'Auth' ||
                        envelope.error.code === EGrpcErrorCode.UNAUTHENTICATED)
                );
            }),
            tap((envelope) => {
                logger.error(`auth error`, envelope.error);
                onError(host.name, envelope);
            }),
            map((envelope) => ({
                state: ESocketAuthenticationState.Failed,
                error: envelope.error,
            })),
        );

        const sessionToken$ = this.callbacks.subscribeToSessionToken(host.name).pipe(
            tap((token) => tap(() => logger.trace(`session token`, host.name, token))),
            distinctUntilChanged(),
        );

        const authProcess$: Observable<TSocketAuthenticationState> = open$.pipe(
            switchMap(() => sessionToken$),
            tap(() => logger.trace(`session token changed`)),
            filter((maybeToken): maybeToken is string => typeof maybeToken === 'string'),
            tap((token) => {
                logger.info('send auth token to socket');
                host.send(
                    createEnvelope({
                        type: EAuthenticationRequestType.Authenticate,
                        bearerToken: token,
                    }),
                );
            }),
            map(() => ({ state: ESocketAuthenticationState.Authenticating })),
        );

        const authReset$: Observable<TSocketAuthenticationState> = close$.pipe(
            map(() => ({ state: ESocketAuthenticationState.NotAuthenticated })),
            tap(() => this.logger.trace('auth reset')),
        );

        return merge(authProcess$, authSuccess$, authError$, authReset$).pipe(
            takeUntil(this.destroyer$),
            endWith({ state: ESocketAuthenticationState.NotAuthenticated }),
            distinctUntilChanged(isEqual),
            tap(({ state }) => {
                logger.info(`update auth state to '${state}'`);
            }),
        );
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
