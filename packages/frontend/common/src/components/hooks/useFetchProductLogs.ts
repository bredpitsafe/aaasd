import { generateTraceId, getNowMilliseconds, milliseconds2iso } from '@common/utils';
import { useCallback } from 'react';

import { useModule } from '../../di/react';
import type { TFetchHistoryParams } from '../../modules/actions/def.ts';
import type { TProductLogSubscriptionFilters } from '../../modules/actions/productLogs/defs.ts';
import { ModuleFetchProductLogs } from '../../modules/actions/productLogs/ModuleFetchProductLogs.ts';
import type { TSocketURL } from '../../types/domain/sockets';

export function useFetchProductLogs(target: TSocketURL, filters: TProductLogSubscriptionFilters) {
    const fetchProductLogs = useModule(ModuleFetchProductLogs);

    return useCallback(
        (
            _params: Omit<TFetchHistoryParams, 'timestamp'> &
                Partial<Pick<TFetchHistoryParams, 'timestamp'>>,
        ) => {
            const traceId = generateTraceId();
            const params: TFetchHistoryParams = {
                ..._params,
                timestamp:
                    _params.timestamp ?? milliseconds2iso(filters.till ?? getNowMilliseconds()),
                timestampBound:
                    filters.since === undefined ? undefined : milliseconds2iso(filters.since),
            };

            return fetchProductLogs({ target, params, filters }, { traceId });
        },
        [fetchProductLogs, target, filters],
    );
}
