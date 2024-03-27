import type { Observable } from 'rxjs';

import { TReceivedData } from '../lib/BFFSocket/def';
import type { TFetchHandler } from '../modules/communicationHandlers/def';
import type { TSocketURL } from '../types/domain/sockets';
import type { Nanoseconds } from '../types/time';
import { EFetchHistoryDirection, TComponentConfig } from './def';

export type TConfigRevisionLookup = Pick<
    TComponentConfig,
    'componentId' | 'componentKind' | 'componentName' | 'digest' | 'platformTime' | 'user'
> & {
    fingerprint: string;
};

type TSendBody = {
    type: 'FetchConfigRevisions';
    id: TConfigRevisionLookup['componentId'];
    params: {
        platformTime: Nanoseconds;
        direction: EFetchHistoryDirection;
        limit: number;
    };
};

type TReceiveBody = {
    type: 'ConfigRevisions';
    revisions: TConfigRevisionLookup[];
};

export function getConfigRevisionsHandle(
    handler: TFetchHandler,
    url: TSocketURL,
    id: TSendBody['id'],
    params: TSendBody['params'],
): Observable<TReceivedData<TReceiveBody>> {
    return handler<TSendBody, TReceiveBody>(url, {
        type: 'FetchConfigRevisions',
        id,
        params,
    });
}
