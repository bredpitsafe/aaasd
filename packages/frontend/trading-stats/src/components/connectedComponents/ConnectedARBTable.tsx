import type { TWithLiveUpdates } from '@frontend/common/src/components/hooks/useLiveUpdates';
import { useTimeZoneInfoSettings } from '@frontend/common/src/components/Settings/hooks/useTimeZoneSettings';
import { EApplicationName } from '@frontend/common/src/types/app';
import type {
    TDailyStats,
    TDailyStatsFilter,
} from '@frontend/common/src/types/domain/tradingStats';
import { ReactElement, useCallback } from 'react';

import { DailyARB } from '../DailyARB';
import { ConnectedDaily } from './ConnectedDaily';

export function ConnectedARBTable(): ReactElement {
    const [{ timeZone }] = useTimeZoneInfoSettings(EApplicationName.TradingStats);

    const renderFn = useCallback(
        (
            filter: TDailyStatsFilter | undefined,
            value: TDailyStats | undefined,
            liveUpdates: TWithLiveUpdates,
        ) => {
            return (
                <DailyARB
                    timeZone={timeZone}
                    exchangeStats={value?.exchangeStats}
                    baseAssetStats={value?.baseAssetStats}
                    {...liveUpdates}
                />
            );
        },
        [timeZone],
    );

    return <ConnectedDaily>{renderFn}</ConnectedDaily>;
}
