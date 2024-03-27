import type { Observable } from 'rxjs';

import { TReceivedData } from '../lib/BFFSocket/def';
import type { TFetchHandler } from '../modules/communicationHandlers/def';
import type { TSocketURL } from '../types/domain/sockets';
import { TComponentConfig } from './def';
import { TConfigRevisionLookup } from './getConfigRevisionsHandle';

export type TConfigRevision = TConfigRevisionLookup & Pick<TComponentConfig, 'config'>;

type TSendBody = {
    type: 'FetchConfigRevision';
    id: TComponentConfig['componentId'];
    digest: string;
};

type TReceiveBody = {
    type: 'ConfigRevision';
    revisions: TConfigRevision[];
};

export function getConfigRevisionHandle(
    handler: TFetchHandler,
    url: TSocketURL,
    id: TSendBody['id'],
    digest: TSendBody['digest'],
): Observable<TReceivedData<TReceiveBody>> {
    return handler<TSendBody, TReceiveBody>(url, {
        type: 'FetchConfigRevision',
        id,
        digest,
    });
}
