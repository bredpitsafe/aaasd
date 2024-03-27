import type { Observable } from 'rxjs';

import { TReceivedData } from '../lib/BFFSocket/def';
import { TFetchHandler, THandlerOptions } from '../modules/communicationHandlers/def';
import { TSocketURL } from '../types/domain/sockets';
import { logger } from '../utils/Tracing';

type TSendBody = {
    type: 'FetchComponentState';
    componentId: number;
    digest: string;
};

type TReceiveBody = {
    state: string;
};

export function fetchComponentStateHandle(
    handler: TFetchHandler,
    url: TSocketURL,
    componentId: number,
    digest: string,
    options: THandlerOptions,
): Observable<TReceivedData<TReceiveBody>> {
    logger.trace('[fetchComponentStateHandle]', {
        url,
        options,
    });

    return handler<TSendBody, TReceiveBody>(
        url,
        {
            type: 'FetchComponentState',
            componentId,
            digest,
        },
        options,
    );
}
