import { Observable, scan, share } from 'rxjs';
import { filter, map, startWith, switchMap } from 'rxjs/operators';

import { TContextRef } from '../../di';
import { subscribeRealAccountsHandle } from '../../handlers/subscribeRealAccountsHandle';
import type { SocketStreamError } from '../../lib/SocketStream/SocketStreamError';
import type { TRealAccount } from '../../types/domain/account';
import { TSocketURL } from '../../types/domain/sockets';
import { tapError } from '../../utils/Rx/tap';
import { UnifierWithCompositeHash } from '../../utils/unifierWithCompositeHash';
import { ModuleCommunication } from '../communication';
import { ModuleNotifications } from '../notifications/module';

export function subscribeToRealAccounts(ctx: TContextRef): Observable<TRealAccount[] | undefined> {
    const { requestStream, currentSocketUrl$ } = ModuleCommunication(ctx);

    const { error } = ModuleNotifications(ctx);

    return currentSocketUrl$.pipe(
        filter((url): url is TSocketURL => url !== undefined),
        switchMap((url) =>
            subscribeRealAccountsHandle(requestStream, url).pipe(
                tapError((err: SocketStreamError) => {
                    error({
                        message: `Real accounts subscription failed`,
                        description: err.message,
                        traceId: err.traceId,
                    });
                }),
                scan(
                    (hash, envelope) => hash.modify(envelope.payload.accounts),
                    new UnifierWithCompositeHash<TRealAccount>(['id']),
                ),
                map((hash) => hash.toArray()),
                startWith(undefined),
            ),
        ),
        share(),
    );
}
