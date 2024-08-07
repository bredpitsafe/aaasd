import type { ValueOf } from '@common/types';

import { ELayoutIds } from '../../layouts';
import { ETradingStatsRoutes } from '../../modules/router/defs';

export function getLayoutId(route?: ValueOf<typeof ETradingStatsRoutes>): ELayoutIds | undefined {
    if (route === ETradingStatsRoutes.Daily) {
        return ELayoutIds.DailyStats;
    }
    if (route === ETradingStatsRoutes.Monthly) {
        return ELayoutIds.MonthlyStats;
    }
}
