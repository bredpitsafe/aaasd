import type { ValueOf } from '@common/types';
import { assertNever } from '@common/utils/src/assert.ts';
import { EBalanceMonitorLayoutPermissions } from '@frontend/common/src/types/domain/balanceMonitor/defs';
import { isNil } from 'lodash-es';

import { EBalanceMonitorRoute } from '../modules/router/def';
import { ELayoutIds } from './index';

export function getLayoutId(route?: ValueOf<typeof EBalanceMonitorRoute>): ELayoutIds {
    if (
        isNil(route) ||
        route === EBalanceMonitorRoute.Stage ||
        route === EBalanceMonitorRoute.Default
    ) {
        return ELayoutIds.BalanceMonitor;
    }

    switch (route) {
        case EBalanceMonitorRoute.BalanceMonitor:
            return ELayoutIds.BalanceMonitor;

        case EBalanceMonitorRoute.InternalTransfers:
            return ELayoutIds.InternalTransfers;

        case EBalanceMonitorRoute.TransferBlockingRules:
            return ELayoutIds.TransferBlockingRules;

        case EBalanceMonitorRoute.AmountLimitsRules:
            return ELayoutIds.AmountLimitsRules;

        case EBalanceMonitorRoute.AutoTransferRules:
            return ELayoutIds.AutoTransferRules;

        default:
            assertNever(route);
    }
}

export function hasPermissionsForLayout(
    id: ELayoutIds,
    permissions: EBalanceMonitorLayoutPermissions[],
): boolean {
    switch (id) {
        case ELayoutIds.BalanceMonitor:
            return permissions.includes(EBalanceMonitorLayoutPermissions.BalanceMonitor);

        case ELayoutIds.InternalTransfers:
            return permissions.includes(EBalanceMonitorLayoutPermissions.InternalTransfers);

        case ELayoutIds.TransferBlockingRules:
            return permissions.includes(EBalanceMonitorLayoutPermissions.BlockingTransferRules);

        case ELayoutIds.AmountLimitsRules:
            return permissions.includes(EBalanceMonitorLayoutPermissions.LimitingTransferRules);

        case ELayoutIds.AutoTransferRules:
            return permissions.includes(EBalanceMonitorLayoutPermissions.AutoTransferRules);

        default:
            assertNever(id);
    }
}
