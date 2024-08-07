import type { TraceId } from '@common/utils';
import { generateTraceId } from '@common/utils';
import { logger } from '@frontend/common/src/utils/Tracing';

import type { TServerActionResponse } from '../../def/actions';

type TRunServerActionGetter<T> = (traceId: TraceId) => Promise<T>;
export async function runServerAction<T>(
    getter: TRunServerActionGetter<T>,
): Promise<TServerActionResponse<T>> {
    try {
        const traceId = generateTraceId();
        const data = await getter(traceId);
        return { state: 'success', data };
    } catch (err) {
        logger.error('[getFormData] action error', err);
        return { state: 'error', error: (err as Error).message };
    }
}
