import { useMemo } from 'react';

import type { TSubscribeToDashboardsListParams } from '../../actors/FullDashboards/actions/dashboardsStorage/createDashboardsListSubscriptionFactory';
import { useBoundDashboardsSwitch } from '../../components/Settings/hooks/useBoundDashboardsSwitch.ts';
import { useScopedDashboardsState } from '../../modules/router/hooks/useScopedDashboardsRoute';

export const useGetDashboardsListFilters = () => {
    const { isScopedDashboardsRoute, currentScope } = useScopedDashboardsState();
    const [showBoundDashboardsOnly, setShowBoundDashboardsOnly] = useBoundDashboardsSwitch();

    const handleScopeFilterChanged = (value: boolean) => {
        setShowBoundDashboardsOnly(value);
    };

    const dashboardsListFiltersParams: TSubscribeToDashboardsListParams = useMemo(
        () =>
            isScopedDashboardsRoute && currentScope && showBoundDashboardsOnly
                ? {
                      filters: {
                          include: {
                              scopes: [currentScope],
                          },
                      },
                  }
                : {},
        [currentScope, isScopedDashboardsRoute, showBoundDashboardsOnly],
    );

    return {
        dashboardsListFiltersParams,
        showBoundDashboardsOnly,
        handleScopeFilterChanged,
        isScopedDashboardsRoute,
        currentScope,
    };
};
