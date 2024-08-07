import type { DependencyList, KeyboardEvent } from 'react';
import { useCallback } from 'react';

export function useKeypressCallback(
    keys: string[],
    callback: (event?: KeyboardEvent) => void,
    deps: DependencyList = [],
): (event: KeyboardEvent) => void {
    return useCallback((event: KeyboardEvent) => {
        if (keys.includes(event.key)) {
            callback(event);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);
}
