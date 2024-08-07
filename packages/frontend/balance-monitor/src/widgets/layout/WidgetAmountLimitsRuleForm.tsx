import type { TraceId } from '@common/utils';
import { generateTraceId } from '@common/utils';
import { Alert } from '@frontend/common/src/components/Alert';
import { LoadingOverlay } from '@frontend/common/src/components/overlays/LoadingOverlay';
import { useModule } from '@frontend/common/src/di/react';
import type { TAmountLimitsRuleInfo } from '@frontend/common/src/types/domain/balanceMonitor/defs';
import { useNotifiedValueDescriptorObservable } from '@frontend/common/src/utils/React/useValueDescriptorObservable.ts';
import {
    isFailValueDescriptor,
    isSyncedValueDescriptor,
} from '@frontend/common/src/utils/ValueDescriptor/utils.ts';
import { isNil } from 'lodash-es';
import { useMemo } from 'react';

import type { TAmountLimitsRuleFormData } from '../../components/Forms/AmountLimitsRules/defs';
import { AmountLimitsRules } from '../../components/Forms/AmountLimitsRules/view';
import { useConnectedAmountLimitsRuleAction } from '../../components/hooks/useConnectedAmountLimitsRuleAction';
import { ModuleSubscribeToCoinInfoOnCurrentStage } from '../../modules/actions/ModuleSubscribeToCoinInfoOnCurrentStage.ts';
import { ModuleSubscribeToConvertRatesOnCurrentStage } from '../../modules/actions/ModuleSubscribeToConvertRatesOnCurrentStage.ts';

export function WidgetAmountLimitsRuleForm({
    traceId,
    editAmountLimitsRule,
    onUpsertedAmountLimitsRule,
}: {
    traceId?: TraceId;
    editAmountLimitsRule?: TAmountLimitsRuleInfo;
    onUpsertedAmountLimitsRule?: VoidFunction;
}) {
    const subscribeToCoinInfo = useModule(ModuleSubscribeToCoinInfoOnCurrentStage);
    const subscribeToConvertRates = useModule(ModuleSubscribeToConvertRatesOnCurrentStage);

    const formTraceId = useMemo(() => traceId ?? generateTraceId(), [traceId]);

    const coinInfo = useNotifiedValueDescriptorObservable(
        subscribeToCoinInfo(undefined, { traceId: formTraceId }),
    );
    const convertRates = useNotifiedValueDescriptorObservable(
        subscribeToConvertRates(undefined, { traceId: formTraceId }),
    );

    const editFormData = useMemo(
        (): TAmountLimitsRuleFormData | undefined =>
            isNil(editAmountLimitsRule)
                ? undefined
                : {
                      id: editAmountLimitsRule.id,
                      coinsMatchRule: editAmountLimitsRule.coinsMatchRule,
                      sourceExchangesMatchRule: editAmountLimitsRule.source.exchangesMatchRule,
                      sourceAccountsMatchRule: editAmountLimitsRule.source.accountsMatchRule,
                      destinationExchangesMatchRule:
                          editAmountLimitsRule.destination.exchangesMatchRule,
                      destinationAccountsMatchRule:
                          editAmountLimitsRule.destination.accountsMatchRule,
                      withOpposite: editAmountLimitsRule.withOpposite,
                      note: editAmountLimitsRule.note,
                      amountMin: editAmountLimitsRule.amountMin,
                      amountMax: editAmountLimitsRule.amountMax,
                      amountCurrency: editAmountLimitsRule.amountCurrency,
                      rulePriority: editAmountLimitsRule.rulePriority,
                      doNotOverride: editAmountLimitsRule.doNotOverride,
                  },
        [editAmountLimitsRule],
    );

    const [createAmountLimitsRule, createAmountLimitsRuleInProgress] =
        useConnectedAmountLimitsRuleAction(onUpsertedAmountLimitsRule, formTraceId);

    if (isFailValueDescriptor(coinInfo)) {
        return <Alert message="Failed to load form data" type="error" showIcon />;
    }

    if (!isSyncedValueDescriptor(coinInfo)) {
        return <LoadingOverlay text="Loading form data..." />;
    }

    return (
        <AmountLimitsRules
            coinInfo={coinInfo.value}
            convertRates={convertRates.value}
            createAmountLimitsRule={createAmountLimitsRule}
            createAmountLimitsRuleInProgress={createAmountLimitsRuleInProgress}
            editFormData={editFormData}
        />
    );
}
