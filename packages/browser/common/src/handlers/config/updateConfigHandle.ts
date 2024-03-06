import type { Observable } from 'rxjs';

import { TReceivedData } from '../../lib/BFFSocket/def';
import { TFetchHandler, THandlerOptions } from '../../modules/communicationHandlers/def';
import type { TComponentId } from '../../types/domain/component';
import { TSocketURL } from '../../types/domain/sockets';
import { logger } from '../../utils/Tracing';
import { getTraceId } from '../utils';
import type { TConfigId } from './def';

type TId = TConfigId | TComponentId;
type TSendBody = {
    type: 'ExecCommand';
    id: TId;
    command: 'UpdateConfig';
    newConfigRaw: string;
    currentDigest?: string;
};

export type TUpdateConfigResponsePayload = {
    id: TConfigId;
    digest: string;
};

const DEFAULT_UPDATE_CONFIG_TIMEOUT = 20_000;

export function updateConfigHandle(
    handler: TFetchHandler,
    url: TSocketURL,
    id: TId,
    config: string,
    currentDigest?: string,
    options?: THandlerOptions,
): Observable<TReceivedData<TUpdateConfigResponsePayload>> {
    const traceId = getTraceId(options);

    logger.trace('[updateConfigHandle]: init observable', { traceId });

    return handler<TSendBody, TUpdateConfigResponsePayload>(
        url,
        {
            type: 'ExecCommand',
            id,
            command: 'UpdateConfig',
            newConfigRaw: config,
            currentDigest,
        },
        { traceId, timeout: DEFAULT_UPDATE_CONFIG_TIMEOUT },
    );
}
