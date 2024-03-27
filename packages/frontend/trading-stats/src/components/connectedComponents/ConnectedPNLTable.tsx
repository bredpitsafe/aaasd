import { TWithLiveUpdates } from '@frontend/common/src/components/hooks/useLiveUpdates';
import { useTimeZoneInfoSettings } from '@frontend/common/src/components/Settings/hooks/useTimeZoneSettings';
import { EApplicationName } from '@frontend/common/src/types/app';
import { TDailyStats, TDailyStatsFilter } from '@frontend/common/src/types/domain/tradingStats';
import { ReactElement, useCallback } from 'react';

import { DailyPNL } from '../DailyPNL';
import { ConnectedDaily } from './ConnectedDaily';

export function ConnectedPNLTable(): ReactElement {
    const [{ timeZone }] = useTimeZoneInfoSettings(EApplicationName.TradingStats);

    const renderFn = useCallback(
        (
            filter: TDailyStatsFilter | undefined,
            value: TDailyStats | undefined,
            liveUpdates: TWithLiveUpdates,
        ) => {
            return (
                <DailyPNL
                    filter={filter}
                    balanceStats={value?.balanceStats}
                    timeZone={timeZone}
                    {...liveUpdates}
                />
            );
        },
        [timeZone],
    );

    return <ConnectedDaily>{renderFn}</ConnectedDaily>;
}
