import type { TContextRef } from '@frontend/common/src/di';
import { assertNever } from '@frontend/common/src/utils/assert';
import { isNil } from 'lodash-es';
import { BehaviorSubject, MonoTypeOperatorFunction, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import type { Actor, ActorContext } from 'webactor';

import type {
    TFullDashboard,
    TFullIndicatorsDashboard,
    TFullRobotDashboard,
    TFullStorageDashboard,
} from '../../../types/fullDashboard';
import {
    isIndicatorsDashboardItemKey,
    isRobotDashboardItemKey,
} from '../../../types/fullDashboard/guards';
import { getExternalRobotDashboard } from '../actions/externalDashboards/getExternalRobotDashboard';
import { getIndicatorsDashboard } from '../actions/externalDashboards/getIndicatorsDashboard';
import { registerExternalDashboardEnvBox } from '../envelope';
import { DashboardsMemoryCache } from './utils/DashboardsMemoryCache';

export function externalDashboardRegistrationEffect(
    ctx: TContextRef,
    context: Actor | ActorContext,
    memoryDashboardsSubject: BehaviorSubject<DashboardsMemoryCache>,
    memoryOriginalDashboardsSubject: BehaviorSubject<DashboardsMemoryCache>,
) {
    const getRobotDashboard$ = getExternalRobotDashboard.bind(null, ctx);
    const getIndicatorsDashboard$ = getIndicatorsDashboard.bind(null, ctx);

    registerExternalDashboardEnvBox.responseStream(context, (dashboardItemKey) => {
        const fullDashboard = memoryDashboardsSubject.getValue().get(dashboardItemKey);

        if (!isNil(fullDashboard)) {
            return of(fullDashboard);
        }

        if (isRobotDashboardItemKey(dashboardItemKey)) {
            return getRobotDashboard$(
                dashboardItemKey.socket,
                dashboardItemKey.robotId,
                dashboardItemKey.dashboard,
                dashboardItemKey.snapshotDate,
                dashboardItemKey.backtestingId,
            ).pipe(
                map(
                    (dashboard): TFullRobotDashboard => ({
                        robotDashboardKey: dashboardItemKey,
                        item: { hasDraft: false },
                        dashboard,
                    }),
                ),
                registerMemoryDashboard(memoryDashboardsSubject, memoryOriginalDashboardsSubject),
            );
        }

        if (isIndicatorsDashboardItemKey(dashboardItemKey)) {
            return getIndicatorsDashboard$(
                dashboardItemKey.socket,
                dashboardItemKey.indicators,
                dashboardItemKey.focusTo,
            ).pipe(
                map(
                    (dashboard): TFullIndicatorsDashboard => ({
                        indicatorsDashboardKey: dashboardItemKey,
                        item: { hasDraft: false },
                        dashboard,
                    }),
                ),
                registerMemoryDashboard(memoryDashboardsSubject, memoryOriginalDashboardsSubject),
            );
        }

        assertNever(dashboardItemKey);
    });
}

function registerMemoryDashboard(
    memoryDashboardsSubject: BehaviorSubject<DashboardsMemoryCache>,
    memoryOriginalDashboardsSubject: BehaviorSubject<DashboardsMemoryCache>,
): MonoTypeOperatorFunction<Exclude<TFullDashboard, TFullStorageDashboard>> {
    return tap((fullDashboard: TFullRobotDashboard | TFullIndicatorsDashboard) => {
        memoryOriginalDashboardsSubject.next(
            DashboardsMemoryCache.set(memoryOriginalDashboardsSubject.getValue(), fullDashboard),
        );
        memoryDashboardsSubject.next(
            DashboardsMemoryCache.set(memoryDashboardsSubject.getValue(), fullDashboard),
        );
    });
}
