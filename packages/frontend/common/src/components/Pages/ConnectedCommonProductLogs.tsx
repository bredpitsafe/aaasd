import type { TimeZone } from '@common/types';
import { memo, useEffect } from 'react';
import { useInterval } from 'react-use';

import type { TProductLogSubscriptionFilters } from '../../modules/actions/productLogs/defs.ts';
import type { TSocketURL } from '../../types/domain/sockets';
import { useFunction } from '../../utils/React/useFunction';
import { useInfinityHistoryProductLogs } from '../hooks/useInfinityHistoryProductLogs';
import { ProductLogsView } from '../ProductLogs/view';
import type { TProductLogsStorageKeys } from '../Tables/TableProductLogs/defs';
import { useProductLogFiltersWithExpiration } from './useProductLogFiltersWithExpiration';

export type TConnectedCommonProductLogsProps = {
    socketUrl: TSocketURL;
    storageKeys: TProductLogsStorageKeys;
    filters?: Partial<TProductLogSubscriptionFilters>;
    timeZone: TimeZone;
};

export const ConnectedCommonProductLogs = memo((props: TConnectedCommonProductLogsProps) => {
    const { filters, setFilters, extendExpiration } = useProductLogFiltersWithExpiration(
        props.storageKeys.hook,
        props.timeZone,
    );

    useEffect(
        () => setFilters(Object.assign({}, filters, props.filters)),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [props.filters],
    );

    const infinityHistory = useInfinityHistoryProductLogs(props.socketUrl, filters);
    const handleTouchTop = useFunction(() => infinityHistory.toggleLive(true));
    const handleUnTouchTop = useFunction(() => infinityHistory.toggleLive(false));

    // Extend expiration while this component is active
    useInterval(extendExpiration, 10_000);

    return (
        <ProductLogsView
            localStorageKey={props.storageKeys.view}
            query={filters}
            onChange={setFilters}
            exportFilename={`Product_Logs`}
            getRows={infinityHistory.getItems$}
            updateTime={infinityHistory.updateTime}
            refreshInfiniteCacheTrigger$={infinityHistory.updateTrigger$}
            timeZone={props.timeZone}
            onTouchTop={handleTouchTop}
            onUnTouchTop={handleUnTouchTop}
        />
    );
});
