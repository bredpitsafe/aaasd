import type { TraceId } from '@common/utils';
import { iso2milliseconds } from '@common/utils';
import { Alert } from '@frontend/common/src/components/Alert';
import { LoadingOverlay } from '@frontend/common/src/components/overlays/LoadingOverlay';
import { useTimeZoneInfoSettings } from '@frontend/common/src/components/Settings/hooks/useTimeZoneSettings';
import { useModule } from '@frontend/common/src/di/react';
import { useTraceId } from '@frontend/common/src/hooks/useTraceId.ts';
import type { TTransferBlockingRuleInfo } from '@frontend/common/src/types/domain/balanceMonitor/defs';
import { ERuleGroups } from '@frontend/common/src/types/domain/balanceMonitor/defs';
import { useNotifiedValueDescriptorObservable } from '@frontend/common/src/utils/React/useValueDescriptorObservable.ts';
import {
    isFailValueDescriptor,
    isSyncedValueDescriptor,
} from '@frontend/common/src/utils/ValueDescriptor/utils.ts';
import { isNil } from 'lodash-es';
import { useMemo } from 'react';

import type { TTransferBlockingRuleFormData } from '../../components/Forms/TransferBlockingRules/defs';
import {
    INITIAL_VALUES,
    TransferBlockingRules,
} from '../../components/Forms/TransferBlockingRules/view';
import { useConnectedTransferBlockingRuleAction } from '../../components/hooks/useConnectedTransferBlockingRuleAction';
import { ModuleSubscribeToCoinInfoOnCurrentStage } from '../../modules/actions/ModuleSubscribeToCoinInfoOnCurrentStage.ts';

export function WidgetTransferBlockingRuleForm({
    traceId,
    editTransferBlockingRule,
    onUpsertedTransferBlockingRule,
}: {
    traceId?: TraceId;
    editTransferBlockingRule?: TTransferBlockingRuleInfo;
    onUpsertedTransferBlockingRule?: VoidFunction;
}) {
    const formTraceId = useTraceId();
    traceId = traceId ?? formTraceId;
    const subscribeToCoinInfo = useModule(ModuleSubscribeToCoinInfoOnCurrentStage);

    const coinInfo = useNotifiedValueDescriptorObservable(
        subscribeToCoinInfo(undefined, { traceId }),
    );

    const editFormData = useMemo(
        (): TTransferBlockingRuleFormData | undefined =>
            isNil(editTransferBlockingRule)
                ? undefined
                : {
                      id: editTransferBlockingRule.id,
                      coinsMatchRule: editTransferBlockingRule.coinsMatchRule,
                      sourceExchangesMatchRule: editTransferBlockingRule.source.exchangesMatchRule,
                      sourceAccountsMatchRule: editTransferBlockingRule.source.accountsMatchRule,
                      destinationExchangesMatchRule:
                          editTransferBlockingRule.destination.exchangesMatchRule,
                      destinationAccountsMatchRule:
                          editTransferBlockingRule.destination.accountsMatchRule,
                      withOpposite: editTransferBlockingRule.withOpposite,
                      showAlert: editTransferBlockingRule.showAlert,
                      disabledGroups:
                          editTransferBlockingRule.disabledGroups === ERuleGroups.None
                              ? ERuleGroups.All
                              : editTransferBlockingRule.disabledGroups,
                      isPermanent:
                          isNil(editTransferBlockingRule.since) &&
                          isNil(editTransferBlockingRule.until),
                      startImmediately: isNil(editTransferBlockingRule.since),
                      startTime: isNil(editTransferBlockingRule.since)
                          ? undefined
                          : iso2milliseconds(editTransferBlockingRule.since),
                      selectEndDate: true,
                      endTime: isNil(editTransferBlockingRule.until)
                          ? undefined
                          : iso2milliseconds(editTransferBlockingRule.until),
                      periodValue: undefined,
                      periodUnit: INITIAL_VALUES.periodUnit,
                      note: editTransferBlockingRule.note,
                  },
        [editTransferBlockingRule],
    );

    const [createTransferBlockingRule, createTransferBlockingRuleInProgress] =
        useConnectedTransferBlockingRuleAction(onUpsertedTransferBlockingRule, traceId);

    const [{ timeZone }] = useTimeZoneInfoSettings();

    if (isFailValueDescriptor(coinInfo)) {
        return <Alert message="Failed to load form data" type="error" showIcon />;
    }

    if (!isSyncedValueDescriptor(coinInfo)) {
        return <LoadingOverlay text="Loading form data..." />;
    }

    return (
        <TransferBlockingRules
            timeZone={timeZone}
            coinInfo={coinInfo.value}
            createTransferBlockingRule={createTransferBlockingRule}
            createTransferBlockingRuleInProgress={createTransferBlockingRuleInProgress}
            editFormData={editFormData}
        />
    );
}
