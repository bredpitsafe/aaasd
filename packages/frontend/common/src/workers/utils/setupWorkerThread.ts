import { Actor } from 'webactor';

import { EWorkerName } from '../defs';
import { setupCollectingClientErrors } from './setupCollectingClientErrors';
import { setupCollectingMemoryUsage } from './setupCollectingMemoryUsage';
import { setupLogsProvider } from './setupLogsProvider';
import { setupWorkerFingerprint } from './setupWorkerFingerprint';

export function setupWorkerThread(name: EWorkerName, root: Actor) {
    setupCollectingClientErrors(name, root);
    setupCollectingMemoryUsage(name, root);
    setupWorkerFingerprint(root);
    setupLogsProvider(root);
}
