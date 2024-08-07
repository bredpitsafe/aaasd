import { useTimeZoneInfoSettings } from '@frontend/common/src/components/Settings/hooks/useTimeZoneSettings';
import { useModule } from '@frontend/common/src/di/react';
import { useTraceId } from '@frontend/common/src/hooks/useTraceId';
import { useNotifiedValueDescriptorObservable } from '@frontend/common/src/utils/React/useValueDescriptorObservable.ts';

import { useConnectedDeleteAutoTransferRule } from '../../components/hooks/useConnectedDeleteAutoTransferRule';
import { useConnectedEditAutoTransferRule } from '../../components/hooks/useConnectedEditAutoTransferRule';
import { TableAutoTransferRules } from '../../components/Tables/TableAutoTransferRules/view';
import { ModuleSubscribeToAutoTransferRulesOnCurrentStage } from '../../modules/actions/ModuleSubscribeToAutoTransferRulesOnCurrentStage.ts';

export function WidgetAutoTransferRulesList() {
    const traceId = useTraceId();
    const subscribeToAutoTransferRules = useModule(
        ModuleSubscribeToAutoTransferRulesOnCurrentStage,
    );

    const autoTransferRules = useNotifiedValueDescriptorObservable(
        subscribeToAutoTransferRules(undefined, { traceId }),
    );

    const [{ timeZone }] = useTimeZoneInfoSettings();

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
