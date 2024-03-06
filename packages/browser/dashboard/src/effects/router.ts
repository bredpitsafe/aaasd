import type { TContextRef } from '@frontend/common/src/di';
import { SocketStreamError } from '@frontend/common/src/lib/SocketStream/SocketStreamError';
import { ModuleBaseActions } from '@frontend/common/src/modules/actions';
import { ModuleActor } from '@frontend/common/src/modules/actor';
import { EDataLoadState } from '@frontend/common/src/types/loadState';
import type { TRouteState } from '@frontend/common/src/types/router';
import { assertNever } from '@frontend/common/src/utils/assert';
import { convertValueDescriptorObservableToPromise } from '@frontend/common/src/utils/Rx/convertValueDescriptorObservableToPromise';
import { isNil } from 'lodash-es';
import { distinctUntilChanged, firstValueFrom } from 'rxjs';
import { first, switchMap, tap } from 'rxjs/operators';

import { getDashboardsLoadStateEnvBox } from '../actors/FullDashboards/envelope';
import { ModuleDashboardActions } from '../modules/actions';
import { ModuleDashboardsStorage } from '../modules/actions/fullDashboards';
import { ModuleDashboardRouter } from '../modules/router/module';
import { ModuleUI } from '../modules/ui/module';
import type { TDashboardItemKey } from '../types/fullDashboard';
import {
    isIndicatorsDashboardItemKey,
    isRobotDashboardItemKey,
    isStorageDashboardItemKey,
} from '../types/fullDashboard/guards';
import { EDashboardRoutes, TDashboardRouterData } from '../types/router';

export function routerEffects(ctx: TContextRef) {
    initViewRouter(ctx);
}

function initViewRouter(ctx: TContextRef) {
    const actor = ModuleActor(ctx);
    const { state$, navigate, router } = ModuleDashboardRouter(ctx);
    const { showError } = ModuleBaseActions(ctx);

    router.start();

    getDashboardsLoadStateEnvBox
        .requestStream(actor, undefined)
        .pipe(
            distinctUntilChanged(),
            first((loadState) => loadState === EDataLoadState.Loaded),
            switchMap(() =>
                state$.pipe(switchMap(({ route }) => proceedDashboardRouteState(ctx, route))),
            ),
        )
        .subscribe({
            error(err) {
                showError(err);

                if (!(err instanceof SocketStreamError) || err.kind !== 'Auth') {
                    void navigate(EDashboardRoutes.Default, {});
                }
            },
        });
}

async function proceedDashboardRouteState(
    ctx: TContextRef,
    route: TRouteState<TDashboardRouterData>,
) {
    const { registerExternalDashboard } = ModuleDashboardsStorage(ctx);
    const { setCurrentDashboardItemKey } = ModuleUI(ctx);

    const itemKey = await routerParamsToDashboardItemKey(ctx, route);

    if (isNil(itemKey)) {
        setCurrentDashboardItemKey(undefined);
        return;
    }

    if (isStorageDashboardItemKey(itemKey)) {
        setCurrentDashboardItemKey(itemKey);
        return;
    }

    if (isRobotDashboardItemKey(itemKey) || isIndicatorsDashboardItemKey(itemKey)) {
        try {
            await firstValueFrom(
                registerExternalDashboard(itemKey).pipe(
                    tap(() => setCurrentDashboardItemKey(itemKey)),
                ),
            );
        } catch (err) {
            const { navigate } = ModuleDashboardRouter(ctx);
            await navigate(EDashboardRoutes.Default, {});
        }
        return;
    }

    assertNever(itemKey);
}

async function routerParamsToDashboardItemKey(
    ctx: TContextRef,
    { name, params }: TRouteState<TDashboardRouterData>,
): Promise<undefined | TDashboardItemKey> {
    switch (name) {
        case EDashboardRoutes.Default:
            return undefined;

        case EDashboardRoutes.Dashboard: {
            const { storageId, serverId } = params;

            if (!isNil(storageId)) {
                return { storageId };
            }

            const { navigate } = ModuleDashboardRouter(ctx);

            if (isNil(serverId)) {
                await navigate(EDashboardRoutes.Default, {});
                return;
            }

            const { fetchDashboardIdByLegacyId } = ModuleDashboardsStorage(ctx);
            const { navigateByDashboardItemKey } = ModuleDashboardActions(ctx);

            try {
                const storageId = await convertValueDescriptorObservableToPromise(
                    fetchDashboardIdByLegacyId(serverId),
                );

                const dashboardItemKey = { storageId };

                await navigateByDashboardItemKey(dashboardItemKey);

                return dashboardItemKey;
            } catch {
                await navigate(EDashboardRoutes.Default, {});
                return;
            }
        }

        case EDashboardRoutes.ReadonlyRobotDashboard: {
            const { socket, robotId, dashboard, focusTo, snapshotDate, dashboardBacktestingId } =
                params;
            return {
                socket,
                robotId,
                dashboard,
                focusTo,
                snapshotDate,
                backtestingId: dashboardBacktestingId,
            };
        }

        case EDashboardRoutes.ReadonlyIndicatorsDashboard: {
            const { socket, indicators, focusTo } = params;
            return {
                socket,
                indicators,
                focusTo,
            };
        }

        default:
            assertNever(name);
    }
}
