import type { Observable } from 'rxjs';

import { TReceivedData } from '../../lib/BFFSocket/def';
import { TFetchHandler } from '../../modules/communicationHandlers/def';
import { TSocketURL } from '../../types/domain/sockets';
import { generateTraceId } from '../../utils/traceId';
import { logger } from '../../utils/Tracing';
import { TUpdatableRealAccount, TUpdatableRealAccountSendBody } from './def';
import { getSendBodyAccounts } from './utils';

type TSendBody = {
    type: 'UpdateAccounts';
    accounts: TUpdatableRealAccountSendBody[];
};

type TReceiveBody = { type: 'ConfigUpdated' };

export function updateRealAccountsHandle(
    handler: TFetchHandler,
    url: TSocketURL,
    accounts: TUpdatableRealAccount[],
): Observable<TReceivedData<TReceiveBody>> {
    const traceId = generateTraceId();

    logger.trace('[updateRealAccountHandle]: init observable', {
        traceId,
    });

    return handler<TSendBody, TReceiveBody>(
        url,
        {
            type: 'UpdateAccounts',
            accounts: getSendBodyAccounts(accounts),
        },
        { traceId },
    );
}
