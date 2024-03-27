import type { Observable } from 'rxjs';
import { filter, map, startWith, switchMap, tap } from 'rxjs/operators';

import { THerodotusAccount } from '../../../../herodotus/src/types/domain';
import { TContextRef } from '../../di';
import { EComponentCommands } from '../../handlers/def';
import { requestComponentCommandHandle } from '../../handlers/sendComponentCommandHandle';
import type { SocketStreamError } from '../../lib/SocketStream/SocketStreamError';
import type { TRobotId } from '../../types/domain/robots';
import { TSocketURL } from '../../types/domain/sockets';
import { ModuleCommunication } from '../communication';
import { ModuleNotifications } from '../notifications/module';

export function getAvailableAccounts(
    ctx: TContextRef,
    robotId: TRobotId,
): Observable<THerodotusAccount[] | undefined> {
    const { request, currentSocketUrl$ } = ModuleCommunication(ctx);
    const { error } = ModuleNotifications(ctx);

    return currentSocketUrl$.pipe(
        filter((url): url is TSocketURL => url !== undefined),
        switchMap((url) =>
            requestComponentCommandHandle<{
                availableAccountsListed: THerodotusAccount[];
            }>(
                request,
                url,
                robotId,
                EComponentCommands.GenericRobotCommand,
                'getAvailableAccountsList',
            ).pipe(
                tap({
                    error(err: SocketStreamError): void {
                        error({
                            message: `Error loading available Herodotus accounts`,
                            description: err.message,
                            traceId: err.traceId,
                        });
                    },
                }),
                map((envelope) => envelope.payload.availableAccountsListed),
                startWith(undefined),
            ),
        ),
    );
}
