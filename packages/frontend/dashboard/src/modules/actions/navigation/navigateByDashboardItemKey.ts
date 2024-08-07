import { assertNever } from '@common/utils/src/assert.ts';
import type { TRouteState } from '@frontend/common/src/types/router';
import { createObservableProcedure } from '@frontend/common/src/utils/LPC/createObservableProcedure.ts';
import { createProcedure } from '@frontend/common/src/utils/LPC/createProcedure.ts';
import { isObject } from 'lodash-es';
import { from, of } from 'rxjs';
import { map } from 'rxjs/operators';

import type { TDashboardItemKey } from '../../../types/fullDashboard';
import {
    isIndicatorsDashboardItemKey,
    isRobotDashboardItemKey,
    isStorageDashboardItemKey,
} from '../../../types/fullDashboard/guards';
import type {
    TDashboardRouteParams,
    TDashboardRouterData,
    TIndicatorsDashboardRouteParams,
    TRobotDashboardRouteParams,
} from '../../../types/router';
import { EDashboardRoutes, EOpenType } from '../../../types/router';
import { ModuleDashboardRouter } from '../../router/module';

export const ModuleNavigateByDashboardItemKey = createObservableProcedure((ctx) => {
    const { getState, navigate, navigateNewTab } = ModuleDashboardRouter(ctx);

    return ({
        key,
        openType = EOpenType.CurrentWindow,
    }: {
        key: TDashboardItemKey | undefined;
        openType?: EOpenType;
    }) => {
        if (openType === EOpenType.NoAction) {
            return of(undefined);
        }

        const routerState = getState();
        const { route, params } = getRouteParamsForURLByDashboardItemKey(
            {
                ...getCommonParams(routerState.route.params),
                ...(routerState.route.name === EDashboardRoutes.Dashboard ||
                routerState.route.name === EDashboardRoutes.Default
                    ? { scope: routerState.route.params.scope }
                    : {}),
            },
            key,
        );

        if (openType === EOpenType.CurrentWindow) {
            return from(navigate(route, params)).pipe(map(() => undefined));
        } else {
            return of(navigateNewTab(route, params)).pipe(map(() => undefined));
        }
    };
});

export const ModuleGetRouteParamsForURLByDashboardItemKey = createProcedure((ctx) => {
    const { getState } = ModuleDashboardRouter(ctx);

    return (key: TDashboardItemKey) => {
        return getRouteParamsForURLByDashboardItemKey(getState().route.params, key);
    };
});

function getRouteParamsForURLByDashboardItemKey(
    currentParams:
        | TDashboardRouteParams
        | TRobotDashboardRouteParams
        | TIndicatorsDashboardRouteParams,
    key: TDashboardItemKey | undefined,
) {
    if (key === undefined) {
        return {
            route: EDashboardRoutes.Dashboard,
            params: {
                ...currentParams,
                storageId: undefined,
            },
        };
    }

    if (isStorageDashboardItemKey(key)) {
        return {
            route: EDashboardRoutes.Dashboard,
            params: {
                ...currentParams,
                storageId: key.storageId,
            },
        };
    }

    if (isRobotDashboardItemKey(key)) {
        return {
            route: EDashboardRoutes.ReadonlyRobotDashboard,
            params: {
                ...currentParams,
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
                ...currentParams,
                socket: key.socket,
                indicators: key.indicators,
            },
        };
    }

    assertNever(key);
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
