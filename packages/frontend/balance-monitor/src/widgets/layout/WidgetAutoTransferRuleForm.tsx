import type { TraceId } from '@common/utils';
import { generateTraceId } from '@common/utils';
import { Alert } from '@frontend/common/src/components/Alert';
import { LoadingOverlay } from '@frontend/common/src/components/overlays/LoadingOverlay';
import { useModule } from '@frontend/common/src/di/react';
import type { TAutoTransferRuleInfo } from '@frontend/common/src/types/domain/balanceMonitor/defs';
import { useNotifiedValueDescriptorObservable } from '@frontend/common/src/utils/React/useValueDescriptorObservable.ts';
import {
    isFailValueDescriptor,
    isSyncedValueDescriptor,
} from '@frontend/common/src/utils/ValueDescriptor/utils.ts';
import { isNil } from 'lodash-es';
import { useMemo } from 'react';

import type { TAutoTransferRuleFormData } from '../../components/Forms/AutoTransferRules/defs';
import { AutoTransferRules } from '../../components/Forms/AutoTransferRules/view';
import { useConnectedAutoTransferRuleAction } from '../../components/hooks/useConnectedAutoTransferRuleAction';
import { ModuleSubscribeToCoinInfoOnCurrentStage } from '../../modules/actions/ModuleSubscribeToCoinInfoOnCurrentStage.ts';

export function WidgetAutoTransferRuleForm({
    traceId,
    editAutoTransferRule,
    onUpsertedAutoTransferRule,
}: {
    traceId?: TraceId;
    editAutoTransferRule?: TAutoTransferRuleInfo;
    onUpsertedAutoTransferRule?: VoidFunction;
}) {
    const subscribeToCoinInfo = useModule(ModuleSubscribeToCoinInfoOnCurrentStage);

    const formTraceId = useMemo(() => traceId ?? generateTraceId(), [traceId]);

    const coinInfo = useNotifiedValueDescriptorObservable(
        subscribeToCoinInfo(undefined, { traceId: formTraceId }),
    );

    const editFormData = useMemo(
        (): TAutoTransferRuleFormData | undefined =>
            isNil(editAutoTransferRule)
                ? undefined
                : {
                      id: editAutoTransferRule.id,
                      coinsMatchRule: editAutoTransferRule.coinsMatchRule,
                      sourceExchangesMatchRule: editAutoTransferRule.source.exchangesMatchRule,
                      sourceAccountsMatchRule: editAutoTransferRule.source.accountsMatchRule,
                      destinationExchangesMatchRule:
                          editAutoTransferRule.destination.exchangesMatchRule,
                      destinationAccountsMatchRule:
                          editAutoTransferRule.destination.accountsMatchRule,
                      withOpposite: editAutoTransferRule.withOpposite,
                      note: editAutoTransferRule.note,
                      enableAuto: editAutoTransferRule.enableAuto,
                      rulePriority: editAutoTransferRule.rulePriority,
                  },
        [editAutoTransferRule],
    );

    const [createAutoTransferRule, createAmountLimitsRuleInProgress] =
        useConnectedAutoTransferRuleAction(onUpsertedAutoTransferRule, formTraceId);

    if (isFailValueDescriptor(coinInfo)) {
        return <Alert message="Failed to load form data" type="error" showIcon />;
    }

    if (!isSyncedValueDescriptor(coinInfo)) {
        return <LoadingOverlay text="Loading form data..." />;
    }

    return (
        <AutoTransferRules
            coinInfo={coinInfo.value}
            createAutoTransferRule={createAutoTransferRule}
            createAutoTransferRuleInProgress={createAmountLimitsRuleInProgress}
            editFormData={editFormData}
        />
    );
}
