import type { Observable } from 'rxjs';

import { TReceivedData } from '../../lib/BFFSocket/def';
import { TFetchHandler, THandlerOptions } from '../../modules/communicationHandlers/def';
import { EComponentConfigType } from '../../types/domain/component';
import { TSocketURL } from '../../types/domain/sockets';
import { logger } from '../../utils/Tracing';
import { getTraceId } from '../utils';
import type { TConfigId } from './def';

type TSendBody = {
    type: 'CreateConfig';
    configType: EComponentConfigType;
    config: string;
    name?: string;
    kind?: string;
};

type TReceiveBody = {
    type: 'ConfigCreated';
    id: TConfigId;
    digest: string;
};

export function createConfigHandle(
    handler: TFetchHandler,
    url: TSocketURL,
    configType: TSendBody['configType'],
    config: TSendBody['config'],
    name?: TSendBody['name'],
    kind?: TSendBody['kind'],
    options?: THandlerOptions,
): Observable<TReceivedData<TReceiveBody>> {
    const traceId = getTraceId(options);

    logger.trace('[createConfigHandle]: init observable', { traceId });

    return handler<TSendBody, TReceiveBody>(
        url,
        {
            type: 'CreateConfig',
            config,
            configType,
            name,
            kind,
        },
        { ...options, traceId },
    );
}
