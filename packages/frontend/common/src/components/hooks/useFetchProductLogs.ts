import { useCallback } from 'react';

import { useModule } from '../../di/react';
import { TFetchHistoryParams } from '../../handlers/def';
import { TProductLogSubscriptionFilters } from '../../handlers/productLogs/defs';
import { ModuleBaseActions } from '../../modules/actions';
import { TSocketURL } from '../../types/domain/sockets';
import { getNowMilliseconds, milliseconds2iso } from '../../utils/time';
import { generateTraceId } from '../../utils/traceId';
import { logger } from '../../utils/Tracing';

export function useFetchProductLogs(url: TSocketURL, filters: TProductLogSubscriptionFilters) {
    const { fetchProductLogs } = useModule(ModuleBaseActions);

    return useCallback(
        (
            _params: Omit<TFetchHistoryParams, 'timestamp'> &
                Partial<Pick<TFetchHistoryParams, 'timestamp'>>,
        ) => {
            const traceId = generateTraceId();
            const options = { traceId };
            const params: TFetchHistoryParams = {
                ..._params,
                timestamp:
                    _params.timestamp ?? milliseconds2iso(filters.till ?? getNowMilliseconds()),
                timestampBound:
                    filters.since === undefined ? undefined : milliseconds2iso(filters.since),
            };

            logger.trace(`[useFetchProductLogs] call`, { url, params, filters, options });

            return fetchProductLogs(url, params, filters, options);
        },
        [fetchProductLogs, url, filters],
    );
}
