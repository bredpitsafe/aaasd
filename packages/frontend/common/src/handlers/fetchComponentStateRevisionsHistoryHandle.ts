import type { Observable } from 'rxjs';

import { TReceivedData } from '../lib/BFFSocket/def';
import { TFetchHandler, THandlerOptions } from '../modules/communicationHandlers/def';
import { TComponentId } from '../types/domain/component';
import { TComponentStateRevision } from '../types/domain/ComponentStateRevision';
import { TSocketURL } from '../types/domain/sockets';
import { ISO } from '../types/time';
import { logger } from '../utils/Tracing';
import { EFetchHistoryDirection } from './def';

const REVISIONS_LIMIT = 100;

type TSendBody = {
    type: 'FetchComponentStateRevisionsHistory';
    componentId: TComponentId;
    btRunNo?: number;
    params: {
        platformTime: ISO;
        direction: EFetchHistoryDirection;
        limit: number;
    };
};

type TReceiveBody = {
    componentStates: Array<TComponentStateRevision>;
};

type TParams = {
    platformTime: ISO;
    componentId: TComponentId;
    btRunNo?: number;
    limit?: number;
};

export function fetchComponentStateRevisionsHistoryHandle(
    handler: TFetchHandler,
    url: TSocketURL,
    { platformTime, componentId, limit, btRunNo }: TParams,
    options: THandlerOptions,
): Observable<TReceivedData<TReceiveBody>> {
    logger.trace('[fetchComponentStateRevisionsHistoryHandle]', {
        url,
        options,
    });

    return handler<TSendBody, TReceiveBody>(
        url,
        {
            type: 'FetchComponentStateRevisionsHistory',
            componentId,
            btRunNo,
            params: {
                platformTime,
                direction: EFetchHistoryDirection.Backward,
                limit: limit ?? REVISIONS_LIMIT,
            },
        },
        options,
    );
}
