import { EnvelopeDispatchTarget } from 'webactor';

import { EApplicationName } from '../../types/app';
import { setupCollectingClientErrors } from './setupCollectingClientErrors';
import { setupCollectingMemoryUsage } from './setupCollectingMemoryUsage';
import { setupCollectingTimeToFrame } from './setupCollectingTimeToFrame';
import { setupFingerprint } from './setupFingerprint';

export function setupTabThread(name: EApplicationName, root: EnvelopeDispatchTarget) {
    setupCollectingClientErrors(name, root);
    setupCollectingMemoryUsage(name, root);
    setupCollectingTimeToFrame(name, root);
    setupFingerprint(root);
}
