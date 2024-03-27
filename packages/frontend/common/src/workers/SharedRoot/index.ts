import { EWorkerIds } from '../defs';
import { SharedWorker } from '../SharedWorker';

export const createSharedWorkerRoot = () => {
    return new SharedWorker(
        /* webpackChunkName: "shared-worker" */ new URL('./sharedWorker.ts', import.meta.url),
        {
            name: EWorkerIds.SharedRoot,
            type: 'module',
        },
    );
};
