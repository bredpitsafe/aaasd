import type { TContextRef } from '@frontend/common/src/di';
import type { TRouteState } from '@frontend/common/src/types/router';
import { assertNever } from '@frontend/common/src/utils/assert';
import { isObject } from 'lodash-es';

import type { TDashboardItemKey } from '../../../types/fullDashboard';
import {
    isIndicatorsDashboardItemKey,
    isRobotDashboardItemKey,
    isStorageDashboardItemKey,
} from '../../../types/fullDashboard/guards';
import {
    EDashboardRoutes,
    EOpenType,
    TDashboardRouteParams,
    TDashboardRouterData,
    TIndicatorsDashboardRouteParams,
    TRobotDashboardRouteParams,
} from '../../../types/router';
import { ModuleDashboardRouter } from '../../router/module';

export function getRouteParamsForURLByDashboardItemKey(ctx: TContextRef, key: TDashboardItemKey) {
    const { getState } = ModuleDashboardRouter(ctx);
    const commonParams = getCommonParams(getState().route.params);

    if (isStorageDashboardItemKey(key)) {
        return {
            route: EDashboardRoutes.Dashboard,
            params: {
                ...commonParams,
                storageId: key.storageId,
            },
        };
    }

    if (isRobotDashboardItemKey(key)) {
        return {
            route: EDashboardRoutes.ReadonlyRobotDashboard,
            params: {
                ...commonParams,
                socket: key.socket,
                dashboard: key.dashboard,
                robotId: key.robotId,
                snapshotDate: key.snapshotDate,
                dashboardBacktestingId: key.backtestingId,
                focusTo: key.focusTo,
            },
        };
    }

    if (isIndicatorsDashboardItemKey(key)) {
        return {
            route: EDashboardRoutes.ReadonlyIndicatorsDashboard,
            params: {
                ...commonParams,
                socket: key.socket,
                indicators: key.indicators,
            },
        };
    }

    assertNever(key);
}

export function navigateByDashboardItemKey(
    ctx: TContextRef,
    key: TDashboardItemKey,
    openType = EOpenType.CurrentWindow,
) {
    if (openType === EOpenType.NoAction) {
        return;
    }

    const { navigate, navigateNewTab } = ModuleDashboardRouter(ctx);
    const { route, params } = getRouteParamsForURLByDashboardItemKey(ctx, key);
    const navigateToDashboard = openType === EOpenType.CurrentWindow ? navigate : navigateNewTab;

    return navigateToDashboard(route, params);
}

export function getURLByDashboardItemKey(ctx: TContextRef, key: TDashboardItemKey) {
    const { buildUrl } = ModuleDashboardRouter(ctx);
    const { route, params } = getRouteParamsForURLByDashboardItemKey(ctx, key);

    return buildUrl(route, params);
}

function hasBacktestingId(
    params: unknown,
): params is TDashboardRouteParams | TRobotDashboardRouteParams | TIndicatorsDashboardRouteParams {
    return isObject(params) && 'backtestingId' in params;
}

function getCommonParams(
    params: unknown,
): Exclude<
    Partial<TRouteState<Omit<TDashboardRouterData, EDashboardRoutes.Default>>>['params'],
    undefined
> {
    const result = {} as ReturnType<typeof getCommonParams>;

    if (hasBacktestingId(params)) {
        result.backtestingId = params.backtestingId;
    }

    return result;
}
