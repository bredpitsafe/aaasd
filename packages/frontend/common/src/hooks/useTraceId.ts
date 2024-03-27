import { useMemo } from 'react';

import { generateTraceId, TraceId } from '../utils/traceId';

export function useTraceId(): TraceId {
    return useMemo(generateTraceId, []);
}
