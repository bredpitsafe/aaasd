import { tapError } from '@common/rx';

import type { TSendEnvelope } from '../../../lib/BFFSocket/def';
import type { SocketStreamError } from '../../../lib/SocketStream/SocketStreamError';
import { logger } from '../../../utils/Tracing';

export function logErrorOperator(request: TSendEnvelope<any>) {
    return tapError((err: SocketStreamError) => {
        logger.error(`[FetchHandlers]: ${err.message}`, {
            socketURL: err.socketURL,
            reason: err.reason,
            traceId: err.traceId,
            timestamp: err.timestamp,
            correlationId: err.correlationId,
            requestType: request.payload.type,
            code: err.code,
            args: err.args,
        });
    });
}
