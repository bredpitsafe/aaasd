import { assertNever } from '@common/utils/src/assert.ts';
import type { ENavType } from '@frontend/common/src/actors/Settings/types';
import { memo } from 'react';

import { ELayoutIds } from '../../layouts';
import { AmountLimitsRulesButton } from './AmountLimitsRulesButton';
import { AutoTransferRulesButton } from './AutoTransferRulesButton';
import { BalanceMonitorButton } from './BalanceMonitorButton';
import { InternalTransfersButton } from './InternalTransfersButton';
import { TransferBlockingRulesButton } from './TransferBlockingRulesButton';

export const LayoutSelector = memo(
    ({ layoutId, type, selected }: { layoutId: ELayoutIds; type: ENavType; selected: boolean }) => {
        switch (layoutId) {
            case ELayoutIds.BalanceMonitor:
                return <BalanceMonitorButton selected={selected} type={type} />;
            case ELayoutIds.InternalTransfers:
                return <InternalTransfersButton selected={selected} type={type} />;
            case ELayoutIds.TransferBlockingRules:
                return <TransferBlockingRulesButton selected={selected} type={type} />;
            case ELayoutIds.AmountLimitsRules:
                return <AmountLimitsRulesButton selected={selected} type={type} />;
            case ELayoutIds.AutoTransferRules:
                return <AutoTransferRulesButton selected={selected} type={type} />;
            default:
                assertNever(layoutId);
        }
    },
);
