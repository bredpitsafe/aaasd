import type { Observable } from 'rxjs';

import { TReceivedData } from '../lib/BFFSocket/def';
import { TFetchHandler, THandlerOptions } from '../modules/communicationHandlers/def';
import { TSocketURL } from '../types/domain/sockets';
import { logger } from '../utils/Tracing';

type TSendBody = {
    type: 'ListGateKinds';
};

type TReceiveBody = {
    execGates: string[];
    mdGates: string[];
};

export function fetchGateKindsHandle(
    handler: TFetchHandler,
    url: TSocketURL,
    options: THandlerOptions,
): Observable<TReceivedData<TReceiveBody>> {
    logger.trace('[fetchGateKindsHandle]', {
        url,
        options,
    });

    return handler<TSendBody, TReceiveBody>(url, { type: 'ListGateKinds' }, options);
}
