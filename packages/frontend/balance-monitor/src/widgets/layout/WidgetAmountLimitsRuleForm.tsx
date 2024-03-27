import { Alert } from '@frontend/common/src/components/Alert';
import { LoadingOverlay } from '@frontend/common/src/components/overlays/LoadingOverlay';
import { useModule } from '@frontend/common/src/di/react';
import type { TAmountLimitsRuleInfo } from '@frontend/common/src/types/domain/balanceMonitor/defs';
import { useSyncObservable } from '@frontend/common/src/utils/React/useSyncObservable';
import { generateTraceId, TraceId } from '@frontend/common/src/utils/traceId';
import { isFailDesc, isSyncDesc, UnscDesc } from '@frontend/common/src/utils/ValueDescriptor';
import { isNil } from 'lodash-es';
import { useMemo } from 'react';

import type { TAmountLimitsRuleFormData } from '../../components/Forms/AmountLimitsRules/defs';
import { AmountLimitsRules } from '../../components/Forms/AmountLimitsRules/view';
import { useConnectedAmountLimitsRuleAction } from '../../components/hooks/useConnectedAmountLimitsRuleAction';
import { ModuleCoinInfo } from '../../modules/observables/ModuleCoinInfo';
import { ModuleConvertRates } from '../../modules/observables/ModuleConvertRates';

export function WidgetAmountLimitsRuleForm({
    traceId,
    editAmountLimitsRule,
    onUpsertedAmountLimitsRule,
}: {
    traceId?: TraceId;
    editAmountLimitsRule?: TAmountLimitsRuleInfo;
    onUpsertedAmountLimitsRule?: VoidFunction;
}) {
    const { getConvertRates$ } = useModule(ModuleConvertRates);
    const { getCoinInfo$ } = useModule(ModuleCoinInfo);

    const formTraceId = useMemo(() => traceId ?? generateTraceId(), [traceId]);

    const coinInfo = useSyncObservable(
        getCoinInfo$(formTraceId),
        useMemo(() => UnscDesc(null), []),
    );

    const convertRates = useSyncObservable(
        getConvertRates$(formTraceId),
        useMemo(() => UnscDesc(null), []),
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

    if (isFailDesc(coinInfo)) {
        return <Alert message="Failed to load form data" type="error" showIcon />;
    }

    if (!isSyncDesc(coinInfo)) {
        return <LoadingOverlay text="Loading form data..." />;
    }

    return (
        <AmountLimitsRules
            coinInfo={coinInfo.value}
            createAmountLimitsRule={createAmountLimitsRule}
            createAmountLimitsRuleInProgress={createAmountLimitsRuleInProgress}
            convertRatesDescriptor={convertRates}
            editFormData={editFormData}
        />
    );
}
