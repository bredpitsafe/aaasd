import type { DebounceSettings } from 'lodash-es';
import { debounce } from 'lodash-es';
import { useRef } from 'react';
import { usePrevious } from 'react-use';

import { useFunction } from './useFunction.ts';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useDebouncedFunction<T extends (...args: any[]) => any>(
    handler: T,
    delay: number,
    options?: DebounceSettings,
) {
    const debounced = useRef<null | ((...args: Parameters<T>) => void)>(null);
    const prevHandler = usePrevious(handler);

    if (prevHandler !== handler) {
        debounced.current = debounce(handler, delay, options);
    }

    return useFunction(debounced.current!);
}
