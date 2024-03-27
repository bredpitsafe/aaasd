import { EnvelopeDispatchTarget } from 'webactor';

import { collectClientErrorsEnvBox } from '../../actors/Metrics/actions';
import { logger } from '../../utils/Tracing';
import { TThreadName } from '../defs';

export function setupCollectingClientErrors(name: TThreadName, root: EnvelopeDispatchTarget): void {
    self.addEventListener('error', (error) => {
        logger.fatal('Uncaught error', error.error);
        collectClientErrorsEnvBox.send(root, { labels: [name] });
    });

    self.addEventListener('unhandledrejection', (error) => {
        logger.fatal('Unhandled rejection', { reason: error.reason });
        collectClientErrorsEnvBox.send(root, { labels: [name] });
    });
}
