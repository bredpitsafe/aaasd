import { generateTraceId } from '@common/utils';
import type { TIndicator } from '@frontend/common/src/modules/actions/indicators/defs.ts';
import type {
    TFetchHandler,
    THandlerOptions,
} from '@frontend/common/src/modules/communicationHandlers/def.ts';
import type { TSocketURL } from '@frontend/common/src/types/domain/sockets.ts';
import { logger } from '@frontend/common/src/utils/Tracing';

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
