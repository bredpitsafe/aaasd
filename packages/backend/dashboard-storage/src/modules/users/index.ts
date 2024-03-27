import { from, map, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { subscribeToUsersUpdates } from '../../db/permissions.ts';
import { EActorName, TActorRequest } from '../../def/actor.ts';
import { SubscribeToUsersRequest } from '../../def/request.ts';
import { SubscribeToUsersResponse } from '../../def/response.ts';
import { logger } from '../../utils/logger.ts';

export function subscribeToUsers(
    req: TActorRequest<SubscribeToUsersRequest>,
): Observable<SubscribeToUsersResponse> {
    logger.info({
        message: '`subscribeToUsers` - started',
        actor: EActorName.Users,
        traceId: req.traceId,
        correlationId: req.correlationId,
    });

    return from(subscribeToUsersUpdates({ user: req.username! })).pipe(
        tap((users) => {
            logger.info({
                message: '`subscribeToUsers` - list received',
                actor: EActorName.Users,
                traceId: req.traceId,
                correlationId: req.correlationId,
                usersLength: users.length,
            });
        }),
        map((list) => {
            return {
                type: 'UsersList',
                list,
            } as SubscribeToUsersResponse;
        }),
    );
}
