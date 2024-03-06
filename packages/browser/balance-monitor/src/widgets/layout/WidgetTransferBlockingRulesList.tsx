import { useTimeZoneInfoSettings } from '@frontend/common/src/components/Settings/hooks/useTimeZoneSettings';
import { useModule } from '@frontend/common/src/di/react';
import { useTraceId } from '@frontend/common/src/hooks/useTraceId';
import { EApplicationName } from '@frontend/common/src/types/app';
import { useSyncObservable } from '@frontend/common/src/utils/React/useSyncObservable';
import { UnscDesc } from '@frontend/common/src/utils/ValueDescriptor';
import { useMemo } from 'react';

import { useConnectedDeleteTransferBlockingRule } from '../../components/hooks/useConnectedDeleteTransferBlockingRule';
import { useConnectedEditTransferBlockingRule } from '../../components/hooks/useConnectedEditTransferBlockingRule';
import { TableTransferBlockingRules } from '../../components/Tables/TableTransferBlockingRules/view';
import { ModuleTransferBlockingRules } from '../../modules/observables/ModuleTransferBlockingRules';

export function WidgetTransferBlockingRulesList() {
    const { getTransferBlockingRules$ } = useModule(ModuleTransferBlockingRules);

    const traceId = useTraceId();

    const transferBlockingRules = useSyncObservable(
        getTransferBlockingRules$(traceId),
        useMemo(() => UnscDesc(null), []),
    );

    const [{ timeZone }] = useTimeZoneInfoSettings(EApplicationName.BalanceMonitor);

    const deleteTransferBlockingRule = useConnectedDeleteTransferBlockingRule(traceId);
    const editTransferBlockingRule = useConnectedEditTransferBlockingRule(traceId);

    return (
        <TableTransferBlockingRules
            timeZone={timeZone}
            transferBlockingRulesDescriptor={transferBlockingRules}
            onDeleteTransferBlockingRule={deleteTransferBlockingRule}
            onEditTransferBlockingRule={editTransferBlockingRule}
        />
    );
}
