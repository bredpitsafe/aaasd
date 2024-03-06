import { first, Observable } from 'rxjs';
import { mapTo, switchMap, tap } from 'rxjs/operators';

import type { TContextRef } from '../../di';
import { createRealAccountsHandle } from '../../handlers/accounts/createRealAccountsHandle';
import type { TUpdatableRealAccount } from '../../handlers/accounts/def';
import { ModuleMessages } from '../../lib/messages';
import type { TSocketURL } from '../../types/domain/sockets';
import { ModuleCommunication } from '../communication';

export const createRealAccounts = (
    ctx: TContextRef,
    realAccounts: TUpdatableRealAccount[],
): Observable<void> => {
    const { update, currentSocketUrl$ } = ModuleCommunication(ctx);
    const { loading, success } = ModuleMessages(ctx);

    const closeMsg = loading(`Creating accounts...`);
    return currentSocketUrl$.pipe(
        first((url): url is TSocketURL => url !== undefined),
        switchMap((url) =>
            createRealAccountsHandle(update, url, realAccounts).pipe(
                tap(() => {
                    closeMsg();
                    void success('Accounts created successfully');
                }),
                mapTo(undefined),
            ),
        ),
    );
};
