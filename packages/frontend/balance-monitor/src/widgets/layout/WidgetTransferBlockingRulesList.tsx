import { useTimeZoneInfoSettings } from '@frontend/common/src/components/Settings/hooks/useTimeZoneSettings';
import { useModule } from '@frontend/common/src/di/react';
import { useTraceId } from '@frontend/common/src/hooks/useTraceId';
import { useNotifiedValueDescriptorObservable } from '@frontend/common/src/utils/React/useValueDescriptorObservable.ts';

import { useConnectedDeleteTransferBlockingRule } from '../../components/hooks/useConnectedDeleteTransferBlockingRule';
import { useConnectedEditTransferBlockingRule } from '../../components/hooks/useConnectedEditTransferBlockingRule';
import { TableTransferBlockingRules } from '../../components/Tables/TableTransferBlockingRules/view';
import { ModuleSubscribeToCurrentTransferRules } from '../../modules/actions/ModuleSubscribeToCurrentTransferRules.ts';

export function WidgetTransferBlockingRulesList() {
    const traceId = useTraceId();
    const subscribeToTransferRules = useModule(ModuleSubscribeToCurrentTransferRules);

    const transferBlockingRules = useNotifiedValueDescriptorObservable(
        subscribeToTransferRules(undefined, { traceId }),
    );

    const [{ timeZone }] = useTimeZoneInfoSettings();

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
