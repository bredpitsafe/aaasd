import { Observable, scan } from 'rxjs';
import { filter, map, startWith, switchMap } from 'rxjs/operators';

import { TContextRef } from '../../di';
import { subscribeVirtualAccountsHandle } from '../../handlers/subscribeVirtualAccountsHandle';
import type { SocketStreamError } from '../../lib/SocketStream/SocketStreamError';
import type { TVirtualAccount } from '../../types/domain/account';
import { TSocketURL } from '../../types/domain/sockets';
import { tapError } from '../../utils/Rx/tap';
import { UnifierWithCompositeHash } from '../../utils/unifierWithCompositeHash';
import { ModuleCommunication } from '../communication';
import { ModuleNotifications } from '../notifications/module';

export function subscribeToVirtualAccounts(
    ctx: TContextRef,
): Observable<TVirtualAccount[] | undefined> {
    const { requestStream, currentSocketUrl$ } = ModuleCommunication(ctx);
    const { error } = ModuleNotifications(ctx);

    return currentSocketUrl$.pipe(
        filter((url): url is TSocketURL => url !== undefined),
        switchMap((url) =>
            subscribeVirtualAccountsHandle(requestStream, url).pipe(
                tapError((err: SocketStreamError) => {
                    error({
                        message: `Virtual accounts subscription failed`,
                        description: err.message,
                        traceId: err.traceId,
                    });
                }),
                scan(
                    (hash, envelope) => hash.modify(envelope.payload.virtualAccounts),
                    new UnifierWithCompositeHash<TVirtualAccount>(['id']),
                ),
                map((hash) => hash.toArray()),
                startWith(undefined),
            ),
        ),
    );
}
