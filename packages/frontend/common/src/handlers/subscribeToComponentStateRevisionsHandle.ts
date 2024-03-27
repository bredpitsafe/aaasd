import type { Observable } from 'rxjs';

import { TReceivedData } from '../lib/BFFSocket/def';
import { THandlerOptions, TStreamHandler } from '../modules/communicationHandlers/def';
import { TComponentId } from '../types/domain/component';
import { TComponentStateRevision } from '../types/domain/ComponentStateRevision';
import { TSocketURL } from '../types/domain/sockets';
import { logger } from '../utils/Tracing';
import { TSubscribed, TUnsubscribe } from './def';

type TParams = {
    componentId: TComponentId;
    btRunNo?: number;
};
type TSendBody =
    | {
          type: 'SubscribeToComponentStateRevisions';
          componentId: TComponentId;
          btRunNo?: number;
      }
    | TUnsubscribe;

type TUpdateBody = {
    type: 'ComponentStateRevisionUpdates';
    componentStates: Array<TComponentStateRevision>;
};

type TReceiveBody = TSubscribed | TUpdateBody;

export function subscribeToComponentStateRevisionsHandle(
    handler: TStreamHandler,
    url: TSocketURL,
    params: TParams,
    options: THandlerOptions,
): Observable<TReceivedData<TReceiveBody>> {
    logger.trace('[subscribeToComponentStateRevisionsHandle]', {
        url,
        componentId: params.componentId,
        options,
    });

    return handler<TSendBody, TReceiveBody>(
        url,
        () => [
            {
                type: 'SubscribeToComponentStateRevisions',
                componentId: params.componentId,
                btRunNo: params.btRunNo,
            },
            {
                type: 'Unsubscribe',
            },
        ],
        options,
    );
}
