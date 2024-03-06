import type { TIndicator } from '../modules/actions/indicators/defs';
import { TFetchHandler, THandlerOptions } from '../modules/communicationHandlers/def';
import { TSocketURL } from '../types/domain/sockets';
import { generateTraceId } from '../utils/traceId';
import { logger } from '../utils/Tracing';

type TSendBody = {
    type: 'PublishIndicators';
    publisher: string;
    indicators: Partial<TIndicator>[];
};

export function publishIndicatorsHandle(
    fetch: TFetchHandler,
    url: TSocketURL,
    publisher: string,
    indicators: Partial<TIndicator>[],
    options?: THandlerOptions,
) {
    const traceId = generateTraceId();

    logger.trace('[publishIndicatorsHandle]: init observable', {
        traceId,
    });

    fetch<TSendBody, {}>(
        url,
        {
            type: 'PublishIndicators',
            publisher,
            indicators,
        },
        {
            ...options,
            traceId,
            enableLogs: false,
            waitForResponse: false,
        },
    ).subscribe();
}
