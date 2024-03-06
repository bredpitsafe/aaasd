import { EnvelopeDispatchTarget } from 'webactor';

import { collectMemoryUsageEnvBox } from '../../actors/Metrics/actions';
import { TThreadName } from '../defs';

type MemoryInfo = {
    totalJSHeapSize: number;
    usedJSHeapSize: number;
    jsHeapSizeLimit: number;
};

function getMemoryInfo(): undefined | MemoryInfo {
    // @ts-ignore
    return performance.memory;
}

export function setupCollectingMemoryUsage(name: TThreadName, root: EnvelopeDispatchTarget): void {
    const init = getMemoryInfo();

    if (init?.usedJSHeapSize !== undefined) {
        setInterval(() => {
            collectMemoryUsageEnvBox.send(root, {
                labels: [name],
                observe: getMemoryInfo()!.usedJSHeapSize,
            });
        }, 30_000);
    }
}
