import { useTimeZoneInfoSettings } from '@frontend/common/src/components/Settings/hooks/useTimeZoneSettings';
import { useModule } from '@frontend/common/src/di/react';
import { useTraceId } from '@frontend/common/src/hooks/useTraceId';
import { EApplicationName } from '@frontend/common/src/types/app';
import { useSyncObservable } from '@frontend/common/src/utils/React/useSyncObservable';
import { UnscDesc } from '@frontend/common/src/utils/ValueDescriptor';
import { useMemo } from 'react';

import { useConnectedDeleteAutoTransferRule } from '../../components/hooks/useConnectedDeleteAutoTransferRule';
import { useConnectedEditAutoTransferRule } from '../../components/hooks/useConnectedEditAutoTransferRule';
import { TableAutoTransferRules } from '../../components/Tables/TableAutoTransferRules/view';
import { ModuleAutoTransferRules } from '../../modules/observables/ModuleAutoTransferRules';

export function WidgetAutoTransferRulesList() {
    const { getAutoTransferRules$ } = useModule(ModuleAutoTransferRules);

    const traceId = useTraceId();

    const autoTransferRules = useSyncObservable(
        getAutoTransferRules$(traceId),
        useMemo(() => UnscDesc(null), []),
    );

    const [{ timeZone }] = useTimeZoneInfoSettings(EApplicationName.BalanceMonitor);

    const deleteAutoTransferRule = useConnectedDeleteAutoTransferRule(traceId);
    const editAutoTransferRule = useConnectedEditAutoTransferRule(traceId);

    return (
        <TableAutoTransferRules
            timeZone={timeZone}
            autoTransferRulesDescriptor={autoTransferRules}
            onDeleteAutoTransferRule={deleteAutoTransferRule}
            onEditAutoTransferRule={editAutoTransferRule}
        />
    );
}
