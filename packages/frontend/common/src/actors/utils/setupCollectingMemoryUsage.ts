import type { EApplicationName } from '@common/types';

import { collectMemoryUsageEnvBox } from '../Metrics/actions.ts';

type MemoryInfo = {
    totalJSHeapSize: number;
    usedJSHeapSize: number;
    jsHeapSizeLimit: number;
};

function getMemoryInfo(): undefined | MemoryInfo {
    // @ts-ignore
    return performance.memory;
}

export function setupCollectingMemoryUsage(name: EApplicationName): void {
    const init = getMemoryInfo();

    if (init?.usedJSHeapSize !== undefined) {
        setInterval(() => {
            collectMemoryUsageEnvBox.send(null, {
                labels: [name],
                observe: getMemoryInfo()!.usedJSHeapSize,
            });
        }, 30_000);
    }
}
