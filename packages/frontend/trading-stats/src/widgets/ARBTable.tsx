import type { Nil } from '@common/types';
import { useTimeZoneInfoSettings } from '@frontend/common/src/components/Settings/hooks/useTimeZoneSettings.ts';
import type { TDailyStats } from '@frontend/common/src/types/domain/tradingStats.ts';
import type { ReactElement } from 'react';
import { useCallback } from 'react';

import { DailyARB } from '../components/DailyARB';
import type { TWidgetDailyStatsProps } from './DailyStats.tsx';
import { WidgetDailyStats } from './DailyStats.tsx';

export function WidgetARBTable(): ReactElement {
    const [{ timeZone }] = useTimeZoneInfoSettings();

    const renderFn: TWidgetDailyStatsProps['children'] = useCallback(
        (filters, dailyStats: Nil | TDailyStats) => {
            return (
                <DailyARB
                    timeZone={timeZone}
                    exchangeStats={dailyStats?.exchangeStats}
                    baseAssetStats={dailyStats?.baseAssetStats}
                />
            );
        },
        [timeZone],
    );

    return <WidgetDailyStats>{renderFn}</WidgetDailyStats>;
}
