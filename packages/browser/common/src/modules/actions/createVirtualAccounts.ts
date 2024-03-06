import { first, Observable } from 'rxjs';
import { mapTo, switchMap, tap } from 'rxjs/operators';

import type { TContextRef } from '../../di';
import {
    createVirtualAccountsHandle,
    TCreatableVirtualAccount,
} from '../../handlers/accounts/createVirtualAccountsHandle';
import { ModuleMessages } from '../../lib/messages';
import type { TSocketURL } from '../../types/domain/sockets';
import { ModuleCommunication } from '../communication';

export const createVirtualAccounts = (
    ctx: TContextRef,
    virtualAccounts: TCreatableVirtualAccount[],
): Observable<void> => {
    const { update, currentSocketUrl$ } = ModuleCommunication(ctx);
    const { loading, info, success } = ModuleMessages(ctx);

    const closeMsg = loading(`Creating accounts...`);
    return currentSocketUrl$.pipe(
        first((url): url is TSocketURL => url !== undefined),
        switchMap((url) =>
            createVirtualAccountsHandle(update, url, virtualAccounts).pipe(
                tap(() => {
                    closeMsg();
                    void success('Accounts created successfully');
                    void info('Reboot corresponding exec gate to apply account changes!', 10);
                }),
                mapTo(undefined),
            ),
        ),
    );
};
