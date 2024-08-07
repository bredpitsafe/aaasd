import type { TContextRef } from '../../di';
import { ModuleApplicationName } from '../../modules/applicationName';
import { setupCollectingClientErrors } from './setupCollectingClientErrors.ts';
import { setupCollectingMemoryUsage } from './setupCollectingMemoryUsage.ts';
import { setupCollectingTimeToFrame } from './setupCollectingTimeToFrame.ts';
import { setupFingerprint } from './setupFingerprint.ts';

export function setupTabThread(ctx: TContextRef) {
    const { appName } = ModuleApplicationName(ctx);

    setupCollectingClientErrors(appName);
    setupCollectingMemoryUsage(appName);
    setupCollectingTimeToFrame(appName);
    setupFingerprint();
}
