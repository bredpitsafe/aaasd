import { assertNever } from '@common/utils/src/assert.ts';
import type { TPageLayoutFactory, TPageLayouts } from '@frontend/common/src/modules/layouts/data';
import type { EBalanceMonitorLayoutPermissions } from '@frontend/common/src/types/domain/balanceMonitor/defs';
import type { TabNode } from 'flexlayout-react';
import type { ITitleObject } from 'flexlayout-react/src/view/Layout';
import type { ReactNode } from 'react';

import {
    amountLimitsRulesLayout,
    amountLimitsRulesLayoutFactory,
    amountLimitsRulesTitleFactory,
} from './amountLimitsRules';
import {
    autoTransferRulesLayout,
    autoTransferRulesLayoutFactory,
    autoTransferRulesTitleFactory,
} from './autoTransferRules';
import {
    balanceMonitorLayoutFactory,
    balanceMonitorTitleFactory,
    getDefaultBalanceMonitorLayout,
} from './balanceMonitor';
import { getCommonComponents } from './common';
import {
    EAmountLimitsRulesLayoutComponents,
    EAutoTransferRulesLayoutComponents,
    EBalanceMonitorLayoutComponents,
    EInternalTransfersLayoutComponents,
    ETransferBlockingRulesLayoutComponents,
} from './defs';
import {
    internalTransfersLayout,
    internalTransfersLayoutFactory,
    internalTransfersTitleFactory,
} from './internalTransfers';
import {
    transferBlockingRulesLayout,
    transferBlockingRulesLayoutFactory,
    transferBlockingRulesTitleFactory,
} from './transferBlockingRules';
import { hasPermissionsForLayout } from './utils';

export enum ELayoutIds {
    BalanceMonitor = 'BalanceMonitor',
    InternalTransfers = 'InternalTransfers',
    TransferBlockingRules = 'TransferBlockingRules',
    AmountLimitsRules = 'AmountLimitsRules',
    AutoTransferRules = 'AutoTransferRules',
}

export const DEFAULT_LAYOUTS: TPageLayouts = {
    [ELayoutIds.BalanceMonitor]: {
        id: ELayoutIds.BalanceMonitor,
        value: getDefaultBalanceMonitorLayout(),
        version: 4,
    },
    [ELayoutIds.InternalTransfers]: {
        id: ELayoutIds.InternalTransfers,
        value: internalTransfersLayout,
        version: 4,
    },
    [ELayoutIds.TransferBlockingRules]: {
        id: ELayoutIds.TransferBlockingRules,
        value: transferBlockingRulesLayout,
        version: 3,
    },
    [ELayoutIds.AmountLimitsRules]: {
        id: ELayoutIds.AmountLimitsRules,
        value: amountLimitsRulesLayout,
        version: 3,
    },
    [ELayoutIds.AutoTransferRules]: {
        id: ELayoutIds.AutoTransferRules,
        value: autoTransferRulesLayout,
        version: 1,
    },
};

export function getSubLayoutFactory(
    id: ELayoutIds,
    permissions: EBalanceMonitorLayoutPermissions[],
): undefined | TPageLayoutFactory {
    if (!hasPermissionsForLayout(id, permissions)) {
        return undefined;
    }

    switch (id) {
        case ELayoutIds.BalanceMonitor:
            return balanceMonitorLayoutFactory(permissions);

        case ELayoutIds.InternalTransfers:
            return internalTransfersLayoutFactory(permissions);

        case ELayoutIds.TransferBlockingRules:
            return transferBlockingRulesLayoutFactory(permissions);

        case ELayoutIds.AmountLimitsRules:
            return amountLimitsRulesLayoutFactory(permissions);

        case ELayoutIds.AutoTransferRules:
            return autoTransferRulesLayoutFactory(permissions);

        default:
            assertNever(id);
    }
}

export function getSubLayoutTitleFactory(
    id: ELayoutIds,
    permissions: EBalanceMonitorLayoutPermissions[],
): undefined | ((node: TabNode) => ITitleObject | ReactNode) {
    if (!hasPermissionsForLayout(id, permissions)) {
        return undefined;
    }

    switch (id) {
        case ELayoutIds.BalanceMonitor:
            return balanceMonitorTitleFactory(permissions);

        case ELayoutIds.InternalTransfers:
            return internalTransfersTitleFactory(permissions);

        case ELayoutIds.TransferBlockingRules:
            return transferBlockingRulesTitleFactory(permissions);

        case ELayoutIds.AmountLimitsRules:
            return amountLimitsRulesTitleFactory(permissions);

        case ELayoutIds.AutoTransferRules:
            return autoTransferRulesTitleFactory(permissions);

        default:
            assertNever(id);
    }
}

const BALANCE_MONITOR_COMPONENTS: string[] = Object.values(EBalanceMonitorLayoutComponents);
const INTERNAL_TRANSFERS_COMPONENTS: string[] = Object.values(EInternalTransfersLayoutComponents);
const TRANSFER_BLOCKING_RULES_COMPONENTS: string[] = Object.values(
    ETransferBlockingRulesLayoutComponents,
);
const AMOUNT_LIMITS_RULES_COMPONENTS: string[] = Object.values(EAmountLimitsRulesLayoutComponents);
const AUTOMATIC_TRANSFER_RULES_COMPONENTS: string[] = Object.values(
    EAutoTransferRulesLayoutComponents,
);

export function getLayoutComponents(
    id: ELayoutIds,
    permissions: EBalanceMonitorLayoutPermissions[],
): string[] {
    if (!hasPermissionsForLayout(id, permissions)) {
        return [];
    }

    let specificComponents: string[];

    switch (id) {
        case ELayoutIds.BalanceMonitor:
            specificComponents = BALANCE_MONITOR_COMPONENTS;
            break;

        case ELayoutIds.InternalTransfers:
            specificComponents = INTERNAL_TRANSFERS_COMPONENTS;
            break;

        case ELayoutIds.TransferBlockingRules:
            specificComponents = TRANSFER_BLOCKING_RULES_COMPONENTS;
            break;

        case ELayoutIds.AmountLimitsRules:
            specificComponents = AMOUNT_LIMITS_RULES_COMPONENTS;
            break;

        case ELayoutIds.AutoTransferRules:
            specificComponents = AUTOMATIC_TRANSFER_RULES_COMPONENTS;
            break;

        default:
            assertNever(id);
    }

    return specificComponents.concat(getCommonComponents(permissions));
}
