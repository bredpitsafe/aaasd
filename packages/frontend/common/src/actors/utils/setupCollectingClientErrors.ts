import type { EApplicationName } from '@common/types';

import { logger } from '../../utils/Tracing';
import { collectClientErrorsEnvBox } from '../Metrics/actions.ts';

export function setupCollectingClientErrors(name: EApplicationName): void {
    self.addEventListener('error', (error) => {
        logger.fatal('Uncaught error', error.error);
        collectClientErrorsEnvBox.send(null, { labels: [name] });
    });

    self.addEventListener('unhandledrejection', (error) => {
        logger.fatal('Unhandled rejection', { reason: error.reason });
        collectClientErrorsEnvBox.send(null, { labels: [name] });
    });
}
