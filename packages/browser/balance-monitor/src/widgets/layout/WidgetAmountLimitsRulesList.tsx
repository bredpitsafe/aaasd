import { useTimeZoneInfoSettings } from '@frontend/common/src/components/Settings/hooks/useTimeZoneSettings';
import { useModule } from '@frontend/common/src/di/react';
import { useTraceId } from '@frontend/common/src/hooks/useTraceId';
import { EApplicationName } from '@frontend/common/src/types/app';
import { useSyncObservable } from '@frontend/common/src/utils/React/useSyncObservable';
import { UnscDesc } from '@frontend/common/src/utils/ValueDescriptor';
import { useMemo } from 'react';

import { useConnectedDeleteAmountLimitsRule } from '../../components/hooks/useConnectedDeleteAmountLimitsRule';
import { useConnectedEditAmountLimitsRule } from '../../components/hooks/useConnectedEditAmountLimitsRule';
import { TableAmountLimitsRules } from '../../components/Tables/TableAmountLimitsRules/view';
import { ModuleAmountLimitsRules } from '../../modules/observables/ModuleAmountLimitsRules';
import { ModuleConvertRates } from '../../modules/observables/ModuleConvertRates';

export function WidgetAmountLimitsRulesList() {
    const { getAmountLimitsRules$ } = useModule(ModuleAmountLimitsRules);
    const { getConvertRates$ } = useModule(ModuleConvertRates);

    const traceId = useTraceId();

    const amountLimitsRules = useSyncObservable(
        getAmountLimitsRules$(traceId),
        useMemo(() => UnscDesc(null), []),
    );

    const convertRates = useSyncObservable(
        getConvertRates$(traceId),
        useMemo(() => UnscDesc(null), []),
    );

    const [{ timeZone }] = useTimeZoneInfoSettings(EApplicationName.BalanceMonitor);

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
