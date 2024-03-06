import { isNil } from 'lodash-es';
import {
    catchError,
    distinctUntilChanged,
    from,
    map,
    Observable,
    of,
    switchMap,
    tap,
    timer,
} from 'rxjs';

import type { TActorRequest, TActorSocketKey } from '../../def/actor.ts';
import { EActorName } from '../../def/actor.ts';
import type { AuthenticateRequest, LogoutRequest } from '../../def/request.ts';
import type { AuthenticateResponse, LogoutResponse } from '../../def/response.ts';
import { TUserName } from '../../def/user.ts';
import { config } from '../../utils/config.ts';
import { ActorError, EActorErrorKind } from '../../utils/errors.ts';
import { keycloak } from '../../utils/keycloak.ts';
import { logger } from '../../utils/logger.ts';
import { metrics } from '../../utils/metrics.ts';
import { generateTraceId } from '../../utils/traceId/index.ts';

type TSocketStateValue = {
    username: TUserName;
    exp: Date;
};
const socketStateMap = new Map<TActorSocketKey, TSocketStateValue>();

export const authenticateSocket = (
    req: TActorRequest<AuthenticateRequest>,
): Observable<AuthenticateResponse> => {
    logger.info({
        message: '`authenticateSocket` - started',
        actor: EActorName.Authentication,
        traceId: req.traceId,
        correlationId: req.correlationId,
    });

    return from(keycloak).pipe(
        switchMap((keycloak) => keycloak.verifyToken(req.payload.bearerToken)),
        tap((res) => {
            // Token expiration time is invalid.
            // This may happen due to token missing `exp` claim or having an incorrect `exp` value
            if (res.exp.getTime() <= new Date().getTime()) {
                metrics.authentication.tokenMissingExpClaimErrors.inc();
                logger.info({
                    message: 'Token `exp` claim is missing or invalid',
                    actor: EActorName.Authentication,
                    traceId: req.traceId,
                    correlationId: req.correlationId,
                    username: res.username,
                    rawToken: req.payload.bearerToken,
                });

                throw new Error('Token `exp` claim is missing or invalid');
            }

            socketStateMap.set(req.socketKey, {
                username: res.username as TUserName,
                exp: res.exp,
            });
            const authenticatedSockets = socketStateMap.size;
            metrics.authentication.authenticatedSockets.set(authenticatedSockets);

            logger.info({
                message: 'Token verification successful',
                actor: EActorName.Authentication,
                traceId: req.traceId,
                correlationId: req.correlationId,
                authenticatedSockets,
                username: res.username,
            });
        }),
        map(({ username }) => {
            return { type: 'Authenticated', username } as AuthenticateResponse;
        }),
        catchError((error: Error) => {
            metrics.authentication.tokenValidationErrors.inc();

            logger.error({
                message: 'Token verification failed',
                actor: EActorName.Authentication,
                traceId: req.traceId,
                correlationId: req.correlationId,
                error: error.message,
            });

            throw new ActorError({
                kind: EActorErrorKind.Authentication,
                title: 'Authentication Failed',
                description: error.message,
            });
        }),
    );
};

export const logoutSocket = (req: TActorRequest<LogoutRequest>): Observable<LogoutResponse> => {
    logger.info({
        message: '`logoutSocket` - started',
        actor: EActorName.Authentication,
        traceId: req.traceId,
        correlationId: req.correlationId,
    });

    return of(undefined).pipe(
        map(() => {
            deauthenticateSocket(req.socketKey);
            return {
                type: 'LoggedOut',
            };
        }),
    );
};

export const deauthenticateSocket = (socketKey: TActorSocketKey): void => {
    socketStateMap.delete(socketKey);
    const authenticatedSockets = socketStateMap.size;
    metrics.authentication.authenticatedSockets.set(authenticatedSockets);
    logger.info({
        message: 'Socket deauthenticated',
        actor: EActorName.Authentication,
        traceId: generateTraceId(),
        authenticatedSockets,
    });
};

export const getUserName = (socketKey: TActorSocketKey): TUserName | undefined => {
    return socketStateMap.get(socketKey)?.username;
};

const isAuthenticated = (socketKey: TActorSocketKey): boolean => {
    const stateValue = socketStateMap.get(socketKey);
    return !isNil(stateValue) && stateValue.exp.getTime() > new Date().getTime();
};

export const isAuthenticated$ = (socketKey: TActorSocketKey): Observable<boolean> => {
    return timer(0, config.authentication.checkExpirationInterval).pipe(
        map(() => isAuthenticated(socketKey)),
        distinctUntilChanged(),
    );
};
