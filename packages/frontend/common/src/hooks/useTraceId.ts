import type { TraceId } from '@common/utils';
import { generateTraceId } from '@common/utils';
import { useMemo } from 'react';

import { EMPTY_ARRAY } from '../utils/const.ts';

export function useTraceId(): TraceId {
    return useMemo(generateTraceId, EMPTY_ARRAY);
}
