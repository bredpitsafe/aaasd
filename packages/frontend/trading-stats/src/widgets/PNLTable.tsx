import type { Nil } from '@common/types';
import { useTimeZoneInfoSettings } from '@frontend/common/src/components/Settings/hooks/useTimeZoneSettings.ts';
import type { TDailyStats } from '@frontend/common/src/types/domain/tradingStats.ts';
import type { ReactElement } from 'react';
import { useCallback } from 'react';

import { DailyPNL } from '../components/DailyPNL';
import type { TWidgetDailyStatsProps } from './DailyStats.tsx';
import { WidgetDailyStats } from './DailyStats.tsx';

export function WidgetPNLTable(): ReactElement {
    const [{ timeZone }] = useTimeZoneInfoSettings();

    const renderFn: TWidgetDailyStatsProps['children'] = useCallback(
        (filters, dailyStats: Nil | TDailyStats) => {
            return <DailyPNL timeZone={timeZone} balanceStats={dailyStats?.balanceStats} />;
        },
        [timeZone],
    );

    return <WidgetDailyStats>{renderFn}</WidgetDailyStats>;
}
