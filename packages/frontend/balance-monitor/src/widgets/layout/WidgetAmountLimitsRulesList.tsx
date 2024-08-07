import { useTimeZoneInfoSettings } from '@frontend/common/src/components/Settings/hooks/useTimeZoneSettings';
import { useModule } from '@frontend/common/src/di/react';
import { useTraceId } from '@frontend/common/src/hooks/useTraceId';
import { useNotifiedValueDescriptorObservable } from '@frontend/common/src/utils/React/useValueDescriptorObservable.ts';

import { useConnectedDeleteAmountLimitsRule } from '../../components/hooks/useConnectedDeleteAmountLimitsRule';
import { useConnectedEditAmountLimitsRule } from '../../components/hooks/useConnectedEditAmountLimitsRule';
import { TableAmountLimitsRules } from '../../components/Tables/TableAmountLimitsRules/view';
import { ModuleSubscribeToConvertRatesOnCurrentStage } from '../../modules/actions/ModuleSubscribeToConvertRatesOnCurrentStage.ts';
import { ModuleSubscribeToCurrentLimitingTransferRules } from '../../modules/actions/ModuleSubscribeToCurrentLimitingTransferRules.ts';

export function WidgetAmountLimitsRulesList() {
    const traceId = useTraceId();
    const subscribeToLimitingTransferRules = useModule(
        ModuleSubscribeToCurrentLimitingTransferRules,
    );
    const subscribeToConvertRates = useModule(ModuleSubscribeToConvertRatesOnCurrentStage);

    const amountLimitsRules = useNotifiedValueDescriptorObservable(
        subscribeToLimitingTransferRules(undefined, { traceId }),
    );
    const convertRates = useNotifiedValueDescriptorObservable(
        subscribeToConvertRates(undefined, { traceId }),
    );

    const [{ timeZone }] = useTimeZoneInfoSettings();

    const deleteAmountLimitsRule = useConnectedDeleteAmountLimitsRule(traceId);
    const editAmountLimitsRule = useConnectedEditAmountLimitsRule(traceId);

    return (
        <TableAmountLimitsRules
            timeZone={timeZone}
            amountLimitsRulesDescriptor={amountLimitsRules}
            convertRatesDescriptor={convertRates}
            onDeleteAmountLimitsRule={deleteAmountLimitsRule}
            onEditAmountLimitsRule={editAmountLimitsRule}
        />
    );
}
