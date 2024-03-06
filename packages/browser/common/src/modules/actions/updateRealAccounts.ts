import { first, Observable } from 'rxjs';
import { mapTo, switchMap, tap } from 'rxjs/operators';

import { TContextRef } from '../../di';
import { TUpdatableRealAccount } from '../../handlers/accounts/def';
import { updateRealAccountsHandle } from '../../handlers/accounts/updateRealAccountsHandle';
import { ModuleMessages } from '../../lib/messages';
import { TSocketURL } from '../../types/domain/sockets';
import { ModuleCommunication } from '../communication';

export const updateRealAccounts = (
    ctx: TContextRef,
    realAccounts: TUpdatableRealAccount[],
): Observable<void> => {
    const { update, currentSocketUrl$ } = ModuleCommunication(ctx);
    const { success, error } = ModuleMessages(ctx);

    return currentSocketUrl$.pipe(
        first((url): url is TSocketURL => url !== undefined),
        switchMap((url) =>
            updateRealAccountsHandle(update, url, realAccounts).pipe(
                tap({
                    next: () => {
                        success('Accounts updated successfully');
                    },
                    error: (err) => {
                        error(`Error updating accounts: ${err}`);
                    },
                }),
                mapTo(undefined),
            ),
        ),
    );
};
