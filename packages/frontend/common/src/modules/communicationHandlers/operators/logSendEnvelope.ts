import type { TSendEnvelope } from '../../../lib/BFFSocket/def';
import type { TSocketURL } from '../../../types/domain/sockets';
import { logger } from '../../../utils/Tracing';
import { prepareEnvelopeToTracing } from '../utils';

export function logSendEnvelope<T extends TSendEnvelope<any>>(url: TSocketURL, envelope: T) {
    logger.trace('[FetchHandlers]: Send envelope', {
        url,
        envelope: prepareEnvelopeToTracing(envelope),
        type: envelope.payload.type,
    });
}
