import { first, Observable } from 'rxjs';
import { mapTo, switchMap, tap } from 'rxjs/operators';

import { TContextRef } from '../../di';
import {
    TUpdatableVirtualAccount,
    updateVirtualAccountsHandle,
} from '../../handlers/accounts/updateVirtualAccountsHandle';
import { ModuleMessages } from '../../lib/messages';
import { TSocketURL } from '../../types/domain/sockets';
import { ModuleCommunication } from '../communication';

export const updateVirtualAccounts = (
    ctx: TContextRef,
    virtualAccounts: TUpdatableVirtualAccount[],
): Observable<void> => {
    const { update, currentSocketUrl$ } = ModuleCommunication(ctx);
    const { info, success, error } = ModuleMessages(ctx);

    return currentSocketUrl$.pipe(
        first((url): url is TSocketURL => url !== undefined),
        switchMap((url) =>
            updateVirtualAccountsHandle(update, url, virtualAccounts).pipe(
                tap({
                    next: () => {
                        success('Accounts updated successfully');
                        info('Reboot corresponding exec gate to apply account changes!', 10);
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
