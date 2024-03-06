import type { Observable } from 'rxjs';

import { TReceivedData } from '../../lib/BFFSocket/def';
import { TFetchHandler } from '../../modules/communicationHandlers/def';
import type { TVirtualAccount } from '../../types/domain/account';
import { TRealAccount } from '../../types/domain/account';
import { TSocketURL } from '../../types/domain/sockets';
import { generateTraceId } from '../../utils/traceId';
import { logger } from '../../utils/Tracing';

export type TUpdatableVirtualAccount = Omit<TVirtualAccount, 'realAccounts'> & {
    realAccounts: Pick<TRealAccount, 'id'>[];
};

type TSendBody = {
    type: 'UpdateVirtualAccounts';
    virtualAccounts: TUpdatableVirtualAccount[];
};

type TReceiveBody = { type: 'ConfigUpdated' };

export function updateVirtualAccountsHandle(
    handler: TFetchHandler,
    url: TSocketURL,
    virtualAccounts: TUpdatableVirtualAccount[],
): Observable<TReceivedData<TReceiveBody>> {
    const traceId = generateTraceId();

    logger.trace('[updateVirtualAccountHandle]: init observable', {
        traceId,
    });

    return handler<TSendBody, TReceiveBody>(
        url,
        {
            type: 'UpdateVirtualAccounts',
            virtualAccounts,
        },
        { traceId },
    );
}
