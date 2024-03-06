import { debounce, DebounceSettings } from 'lodash-es';
import { useRef } from 'react';

import { useFunction } from './useFunction';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useDebouncedFunction<T extends (...args: any[]) => any>(
    handler: T,
    delay: number,
    options?: DebounceSettings,
) {
    const ref = useRef<T>(handler);

    ref.current = handler;

    return useFunction(
        debounce((...args: Parameters<T>): void => ref.current(...args), delay, options),
    );
}
