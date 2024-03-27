import type { Observable } from 'rxjs';

import { TReceivedData } from '../../lib/BFFSocket/def';
import { TFetchHandler } from '../../modules/communicationHandlers/def';
import type { TRealAccount, TVirtualAccount } from '../../types/domain/account';
import { TSocketURL } from '../../types/domain/sockets';
import { generateTraceId } from '../../utils/traceId';
import { logger } from '../../utils/Tracing';

export type TCreatableVirtualAccount = {
    name: TVirtualAccount['name'];
    realAccountIds: TRealAccount['id'][];
};

type TSendBody = {
    type: 'CreateVirtualAccounts';
    virtualAccounts: TCreatableVirtualAccount[];
};

type TReceiveBody = { type: 'ConfigUpdated' };

export function createVirtualAccountsHandle(
    handler: TFetchHandler,
    url: TSocketURL,
    virtualAccounts: TCreatableVirtualAccount[],
): Observable<TReceivedData<TReceiveBody>> {
    const traceId = generateTraceId();

    logger.trace('[createVirtualAccountsHandle]: init observable', {
        traceId,
        virtualAccounts,
    });

    return handler<TSendBody, TReceiveBody>(
        url,
        {
            type: 'CreateVirtualAccounts',
            virtualAccounts,
        },
        { traceId },
    );
}
