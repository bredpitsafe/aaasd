import { catchError, from, map, of, switchMap, tap } from 'rxjs';

import { EActorName } from '../../def/actor.ts';
import type { TUserName } from '../../def/user.ts';
import { ERpcMethod } from '../../rpc/def.ts';
import { tokenVerificationError } from '../../rpc/errors.ts';
import { createRpcRoutes } from '../../rpc/utils.ts';
import { keycloak } from '../../utils/keycloak.ts';
import { metrics } from '../metrics/service.ts';
import { EAuthRouteName } from './def.ts';

export const authRpcRoutes = createRpcRoutes<EAuthRouteName>({
    [EAuthRouteName.Authenticate]: {
        method: ERpcMethod.CALL,
        options: {
            skipAuth: true,
        },
        handler({ req, session, logger }) {
            logger = logger.createChildLogger({
                actor: EActorName.Authentication,
            });

            return from(keycloak).pipe(
                switchMap((keycloak) => keycloak.verifyToken(req.payload.bearerToken)),
                map((res) => {
                    // Token expiration time is invalid.
                    // This may happen due to token missing `exp` claim or having an incorrect `exp` value
                    if (res.exp.getTime() <= new Date().getTime()) {
                        metrics.authentication.tokenMissingExpClaimErrors.inc();
                        logger.info({
                            message: 'Token `exp` claim is missing or invalid',
                            username: res.username as TUserName,
                            rawToken: req.payload.bearerToken,
                        });

                        // TODO: custom error
                        throw new Error('Token `exp` claim is missing or invalid');
                    }

                    session.authenticate({
                        rawToken: req.payload.bearerToken,
                        username: res.username as TUserName,
                        exp: res.exp,
                    });

                    return {
                        type: 'Authenticated',
                        username: res.username as TUserName,
                    } as const;
                }),
                catchError((error: unknown) => {
                    metrics.authentication.tokenValidationErrors.inc();

                    logger.error({
                        message: 'Token verification failed',
                        error,
                    });
                    logger.debug({ message: (error as Error).stack ?? '' });

                    throw tokenVerificationError(error);
                }),
            );
        },
    },
    [EAuthRouteName.Logout]: {
        method: ERpcMethod.CALL,
        options: {
            skipAuth: true,
        },
        handler({ session }) {
            return of({ type: 'LoggedOut' } as const).pipe(
                tap(() => {
                    session.deauthenticate();
                }),
            );
        },
    },
});
