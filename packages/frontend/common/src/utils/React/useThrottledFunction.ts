import type { ThrottleSettings } from 'lodash-es';
import { throttle } from 'lodash-es';
import { useRef } from 'react';
import { usePrevious } from 'react-use';

import { useFunction } from './useFunction.ts';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useThrottledFunction<T extends (...args: any[]) => any>(
    handler: T,
    delay: number,
    options?: ThrottleSettings,
) {
    const throttled = useRef<null | ((...args: Parameters<T>) => void)>(null);
    const prevHandler = usePrevious(handler);

    if (prevHandler !== handler) {
        throttled.current = throttle(handler, delay, options);
    }

    return useFunction(throttled.current!);
}
