import { tapError } from '@common/rx';
import { generateTraceId } from '@common/utils';
import { assertNever } from '@common/utils/src/assert.ts';
import type { TContextRef } from '@frontend/common/src/di';
import { SocketStreamError } from '@frontend/common/src/lib/SocketStream/SocketStreamError';
import { EDataLoadState } from '@frontend/common/src/types/loadState';
import type { TRouteState } from '@frontend/common/src/types/router';
import { createObservableProcedure } from '@frontend/common/src/utils/LPC/createObservableProcedure.ts';
import { createRemoteProcedureCall } from '@frontend/common/src/utils/RPC/createRemoteProcedureCall.ts';
import { ModuleNotifyErrorAndFail } from '@frontend/common/src/utils/Rx/ModuleNotify.ts';
import { distinctValueDescriptorUntilChanged } from '@frontend/common/src/utils/Rx/ValueDescriptor2.ts';
import { isNil } from 'lodash-es';
import type { Observable } from 'rxjs';
import { from, of } from 'rxjs';
import { first, switchMap } from 'rxjs/operators';

import { getDashboardsLoadStateProcedureDescriptor } from '../actors/FullDashboards/descriptors.ts';
import { ModuleNavigateByDashboardItemKey } from '../modules/actions/navigation/navigateByDashboardItemKey.ts';
import { ModuleDashboardRouter } from '../modules/router/module';
import { ModuleUI } from '../modules/ui/module';
import type { TDashboardItemKey } from '../types/fullDashboard';
import {
    isIndicatorsDashboardItemKey,
    isRobotDashboardItemKey,
    isStorageDashboardItemKey,
} from '../types/fullDashboard/guards';
import type { TDashboardRouterData } from '../types/router';
import { EDashboardRoutes } from '../types/router';

export function routerEffects(ctx: TContextRef) {
    initViewRouter(ctx);
}

const ModuleGetDashboardsLoadState = createRemoteProcedureCall(
    getDashboardsLoadStateProcedureDescriptor,
)();

function initViewRouter(ctx: TContextRef) {
    const { state$, router } = ModuleDashboardRouter(ctx);
    const navigateByDashboardItemKey = ModuleNavigateByDashboardItemKey(ctx);
    const notifyErrorAndFail = ModuleNotifyErrorAndFail(ctx);
    const getDashboardsLoadState = ModuleGetDashboardsLoadState(ctx);
    const proceedDashboardRouteState = ModuleProceedDashboardRouteState(ctx);

    router.start();

    getDashboardsLoadState(undefined, { traceId: generateTraceId() })
        .pipe(
            distinctValueDescriptorUntilChanged(),
            first(({ value }) => value === EDataLoadState.Loaded),
            switchMap(() =>
                state$.pipe(
                    switchMap(({ route }) =>
                        proceedDashboardRouteState(route, { traceId: generateTraceId() }),
                    ),
                ),
            ),
            notifyErrorAndFail(),
            tapError((err) => {
                if (!(err instanceof SocketStreamError) || err.kind !== 'Auth') {
                    navigateByDashboardItemKey({ key: undefined }, { traceId: generateTraceId() });
                }
            }),
        )
        .subscribe();
}

const ModuleProceedDashboardRouteState = createObservableProcedure((ctx) => {
    const { setCurrentDashboardItemKey } = ModuleUI(ctx);
    const routerParamsToDashboardItemKey = ModuleRouterParamsToDashboardItemKey(ctx);

    return (route: TRouteState<TDashboardRouterData>, options) => {
        return routerParamsToDashboardItemKey(route, options).pipe(
            switchMap((itemKey) => {
                if (isNil(itemKey)) {
                    setCurrentDashboardItemKey(undefined);
                    return of(undefined);
                }

                if (
                    isStorageDashboardItemKey(itemKey) ||
                    isRobotDashboardItemKey(itemKey) ||
                    isIndicatorsDashboardItemKey(itemKey)
                ) {
                    setCurrentDashboardItemKey(itemKey);
                    return of(undefined);
                }

                assertNever(itemKey);
            }),
        );
    };
});

const ModuleRouterParamsToDashboardItemKey = createObservableProcedure((ctx) => {
    const { navigate } = ModuleDashboardRouter(ctx);

    return ({
        name,
        params,
    }: TRouteState<TDashboardRouterData>): Observable<undefined | TDashboardItemKey> => {
        switch (name) {
            case EDashboardRoutes.Default:
                return of(undefined);

            case EDashboardRoutes.Dashboard: {
                const { storageId, scope } = params;

                if (!isNil(storageId)) {
                    return of({ storageId });
                }

                return from(
                    navigate(EDashboardRoutes.Default, {
                        scope,
                    }).then(() => undefined),
                );
            }

            case EDashboardRoutes.ReadonlyRobotDashboard: {
                const {
                    socket,
                    robotId,
                    dashboard,
                    focusTo,
                    snapshotDate,
                    dashboardBacktestingId,
                } = params;

                return of({
                    socket,
                    robotId,
                    dashboard,
                    focusTo,
                    snapshotDate,
                    backtestingId: dashboardBacktestingId,
                });
            }

            case EDashboardRoutes.ReadonlyIndicatorsDashboard: {
                const { socket, indicators, focusTo } = params;

                return of({
                    socket,
                    indicators,
                    focusTo,
                });
            }

            default:
                assertNever(name);
        }
    };
});
