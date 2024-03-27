import type { TContextRef } from '@frontend/common/src/di';
import { ModuleNotifications } from '@frontend/common/src/modules/notifications/module';
import { ModuleSocketPage } from '@frontend/common/src/modules/socketPage';
import type { ValueOf } from '@frontend/common/src/types';
import { EBalanceMonitorLayoutPermissions } from '@frontend/common/src/types/domain/balanceMonitor/defs';
import { assertNever } from '@frontend/common/src/utils/assert';
import { generateTraceId } from '@frontend/common/src/utils/traceId';
import { isSyncDesc } from '@frontend/common/src/utils/ValueDescriptor';
import { combineLatest } from 'rxjs';

import { ELayoutIds, getSubLayoutFactory } from '../layouts';
import { ModulePermissions } from '../modules/observables/ModulePermissions';
import { EBalanceMonitorRoute } from '../modules/router/def';
import { ModuleBalanceMonitorRouter } from '../modules/router/module';

export function routerEffects(ctx: TContextRef): void {
    initViewRouter(ctx);
}

function initViewRouter(ctx: TContextRef): void {
    const { state$, navigate, router } = ModuleBalanceMonitorRouter(ctx);
    const { getPermissions$ } = ModulePermissions(ctx);
    const { error } = ModuleNotifications(ctx);
    const { resetCurrentSocket } = ModuleSocketPage(ctx);

    router.start();

    const traceId = generateTraceId();

    combineLatest([state$, getPermissions$(traceId)]).subscribe(
        async ([state, permissionsDesc]) => {
            if (state === undefined || !isSyncDesc(permissionsDesc)) {
                return;
            }

            if (permissionsDesc.value.length === 0) {
                if (state.route.name !== EBalanceMonitorRoute.Default) {
                    error({
                        message: `Not enough permissions`,
                        description: `Permissions list is empty`,
                        traceId: traceId,
                    });

                    resetCurrentSocket();

                    await navigate(EBalanceMonitorRoute.Default, state.route.params, {
                        replace: true,
                    });
                }

                return;
            }

            const newRoute = getBestMatchRouter(state.route.name, permissionsDesc.value);

            if (newRoute !== state.route.name) {
                await navigate(newRoute, state.route.params, {
                    replace: true,
                });
            }
        },
    );
}

function getBestMatchRouter(
    current: ValueOf<typeof EBalanceMonitorRoute>,
    permissions: EBalanceMonitorLayoutPermissions[],
) {
    switch (current) {
        case EBalanceMonitorRoute.Default:
            return EBalanceMonitorRoute.Default;

        case EBalanceMonitorRoute.Stage:
            return getFirstAvailable(permissions);

        case EBalanceMonitorRoute.BalanceMonitor:
            if (getSubLayoutFactory(ELayoutIds.BalanceMonitor, permissions)) {
                return EBalanceMonitorRoute.BalanceMonitor;
            }
            return getFirstAvailable(permissions);

        case EBalanceMonitorRoute.InternalTransfers:
            if (getSubLayoutFactory(ELayoutIds.InternalTransfers, permissions)) {
                return EBalanceMonitorRoute.InternalTransfers;
            }
            return getFirstAvailable(permissions);

        case EBalanceMonitorRoute.TransferBlockingRules:
            if (getSubLayoutFactory(ELayoutIds.TransferBlockingRules, permissions)) {
                return EBalanceMonitorRoute.TransferBlockingRules;
            }
            return getFirstAvailable(permissions);

        case EBalanceMonitorRoute.AmountLimitsRules:
            if (getSubLayoutFactory(ELayoutIds.AmountLimitsRules, permissions)) {
                return EBalanceMonitorRoute.AmountLimitsRules;
            }
            return getFirstAvailable(permissions);

        case EBalanceMonitorRoute.AutoTransferRules:
            if (getSubLayoutFactory(ELayoutIds.AutoTransferRules, permissions)) {
                return EBalanceMonitorRoute.AutoTransferRules;
            }
            return getFirstAvailable(permissions);

        default:
            assertNever(current);
    }
}

function getFirstAvailable(
    permissions: EBalanceMonitorLayoutPermissions[],
): ValueOf<typeof EBalanceMonitorRoute> {
    if (permissions.includes(EBalanceMonitorLayoutPermissions.BalanceMonitor)) {
        return EBalanceMonitorRoute.BalanceMonitor;
    }

    if (permissions.includes(EBalanceMonitorLayoutPermissions.InternalTransfers)) {
        return EBalanceMonitorRoute.InternalTransfers;
    }

    if (permissions.includes(EBalanceMonitorLayoutPermissions.BlockingTransferRules)) {
        return EBalanceMonitorRoute.TransferBlockingRules;
    }

    if (permissions.includes(EBalanceMonitorLayoutPermissions.LimitingTransferRules)) {
        return EBalanceMonitorRoute.AmountLimitsRules;
    }

    return EBalanceMonitorRoute.Default;
}
