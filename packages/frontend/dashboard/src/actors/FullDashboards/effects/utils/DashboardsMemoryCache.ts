import { isNil, omit, sortBy, values } from 'lodash-es';

import type {
    TDashboardItemKey,
    TFullDashboard,
    TFullIndicatorsDashboard,
    TFullRobotDashboard,
    TFullStorageDashboard,
    TIndicatorsDashboardItemKey,
    TRobotDashboardItemKey,
    TStorageDashboardItemKey,
} from '../../../../types/fullDashboard';
import {
    getDashboardItemKeyFromDashboard,
    getUniqueDashboardItemKey,
} from '../../../../utils/dashboards';

export class DashboardsMemoryCache {
    private readonly cache: Record<string, TFullDashboard>;

    private constructor(cache = {} as Record<string, TFullDashboard>) {
        this.cache = cache;
    }

    static create(): DashboardsMemoryCache {
        return new DashboardsMemoryCache();
    }

    static set(
        dashboardsCache: DashboardsMemoryCache,
        fullDashboard: TFullDashboard,
    ): DashboardsMemoryCache {
        const key = getUniqueDashboardItemKey(getDashboardItemKeyFromDashboard(fullDashboard));

        return new DashboardsMemoryCache({
            ...dashboardsCache.cache,
            [key]: fullDashboard,
        });
    }

    static remove(
        dashboardsCache: DashboardsMemoryCache,
        dashboardItemKey: TDashboardItemKey,
    ): DashboardsMemoryCache {
        const key = getUniqueDashboardItemKey(dashboardItemKey);

        return new DashboardsMemoryCache(omit(dashboardsCache.cache, key));
    }

    has(dashboardItemKey: TDashboardItemKey): boolean {
        return !isNil(this.get(dashboardItemKey));
    }

    get(dashboardItemKey: TStorageDashboardItemKey): TFullStorageDashboard | undefined;
    get(dashboardItemKey: TRobotDashboardItemKey): TFullRobotDashboard | undefined;
    get(dashboardItemKey: TIndicatorsDashboardItemKey): TFullIndicatorsDashboard | undefined;
    get(
        dashboardItemKey: Exclude<TDashboardItemKey, TStorageDashboardItemKey>,
    ): Exclude<TFullDashboard, TFullStorageDashboard> | undefined;
    get(dashboardItemKey: TDashboardItemKey): TFullDashboard | undefined;
    get(dashboardItemKey: TDashboardItemKey): TFullDashboard | undefined {
        const key = getUniqueDashboardItemKey(dashboardItemKey);

        return this.cache[key];
    }

    getAll(): TFullDashboard[] {
        return sortBy(values(this.cache), ({ dashboard: { name } }) => name);
    }
}
