import type { Observable } from 'rxjs';

import { TReceivedData } from '../../lib/BFFSocket/def';
import { TFetchHandler } from '../../modules/communicationHandlers/def';
import { TSocketURL } from '../../types/domain/sockets';
import { generateTraceId } from '../../utils/traceId';
import { logger } from '../../utils/Tracing';
import { TUpdatableRealAccount, TUpdatableRealAccountSendBody } from './def';
import { getSendBodyAccounts } from './utils';

type TSendBody = {
    type: 'CreateAccounts';
    accounts: TUpdatableRealAccountSendBody[];
};

type TReceiveBody = { type: 'ConfigUpdated' };

export function createRealAccountsHandle(
    handler: TFetchHandler,
    url: TSocketURL,
    accounts: TUpdatableRealAccount[],
): Observable<TReceivedData<TReceiveBody>> {
    const traceId = generateTraceId();

    logger.trace('[CreateAccountsHandle]: init observable', {
        traceId,
    });

    return handler<TSendBody, TReceiveBody>(
        url,
        {
            type: 'CreateAccounts',
            accounts: getSendBodyAccounts(accounts),
        },
        { traceId },
    );
}
