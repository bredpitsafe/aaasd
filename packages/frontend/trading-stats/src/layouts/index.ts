import type {
    TLayoutId,
    TPageLayoutFactory,
    TPageLayouts,
} from '@frontend/common/src/modules/layouts/data';

import {
    dailyPageLayout,
    EDailyStatsLayoutComponents,
    getComponent as getDailyComponent,
} from './daily';
import { createGlobalLayout } from './global';
import {
    EMonthlyStatsLayoutComponents,
    getComponent as getMonthlyComponent,
    monthlyPageLayout,
} from './monthly';

export enum ELayoutIds {
    Global = 'Global',
    DailyStats = 'DailyStats',
    MonthlyStats = 'MonthlyStats',
}

export const DEFAULT_LAYOUTS: TPageLayouts = {
    [ELayoutIds.Global]: {
        id: ELayoutIds.Global,
        value: createGlobalLayout(),
    },
    [ELayoutIds.DailyStats]: {
        id: ELayoutIds.DailyStats,
        value: dailyPageLayout,
    },
    [ELayoutIds.MonthlyStats]: {
        id: ELayoutIds.DailyStats,
        value: monthlyPageLayout,
    },
};

export function getSubLayoutFactory(id: TLayoutId): TPageLayoutFactory {
    switch (id) {
        case ELayoutIds.MonthlyStats: {
            return getMonthlyComponent;
        }

        case ELayoutIds.DailyStats:
        default: {
            return getDailyComponent;
        }
    }
}

export function getLayoutComponents(id?: ELayoutIds): string[] {
    switch (id) {
        case ELayoutIds.DailyStats: {
            return Object.values(EDailyStatsLayoutComponents);
        }
        case ELayoutIds.MonthlyStats: {
            return Object.values(EMonthlyStatsLayoutComponents);
        }

        case ELayoutIds.Global:
        default: {
            return [];
        }
    }
}
