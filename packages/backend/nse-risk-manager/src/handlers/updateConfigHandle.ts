import type { TReceivedData } from '@frontend/common/src/lib/BFFSocket/def';
import { getTraceId } from '@frontend/common/src/modules/actions/utils';
import type {
    TFetchHandler,
    THandlerOptions,
} from '@frontend/common/src/modules/communicationHandlers/def';
import type { TComponentId } from '@frontend/common/src/types/domain/component';
import type { TSocketURL } from '@frontend/common/src/types/domain/sockets';
import { logger } from '@frontend/common/src/utils/Tracing';
import type { Observable } from 'rxjs';

import type { TConfigId } from '../def/config';

type TId = TConfigId | TComponentId;
type TSendBody = {
    type: 'ExecCommand';
    id: TId;
    command: 'UpdateConfig';
    newConfigRaw: string;
    currentDigest?: string;
};

type TUpdateConfigResponsePayload = {
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
