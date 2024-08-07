import type { TraceId } from '@common/utils';
import { useModule } from '@frontend/common/src/di/react';
import { ModuleModals } from '@frontend/common/src/lib/modals';
import type { TAmountLimitsRuleInfo } from '@frontend/common/src/types/domain/balanceMonitor/defs';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { useNotifiedObservableFunction } from '@frontend/common/src/utils/React/useObservableFunction.ts';
import { useNotifiedValueDescriptorObservable } from '@frontend/common/src/utils/React/useValueDescriptorObservable.ts';
import { isSyncedValueDescriptor } from '@frontend/common/src/utils/ValueDescriptor/utils.ts';

import { ModuleDeleteLimitingTransferRuleOnCurrentStage } from '../../modules/actions/ModuleDeleteLimitingTransferRuleOnCurrentStage.ts';
import { ModuleSubscribeToConvertRatesOnCurrentStage } from '../../modules/actions/ModuleSubscribeToConvertRatesOnCurrentStage.ts';
import { AmountLimitsRuleConfirmation } from './components/AmountLimitsRuleConfirmation';

const DELETE_OPTIONS = {
    mapError: () => ({ message: 'Failed to delete amount limits rule' }),
    getNotifyTitle: () => ({
        loading: 'Delete Amount Limits Rule',
        success: 'Amount limits rule deleted successfully',
    }),
};

export function useConnectedDeleteAmountLimitsRule(
    traceId: TraceId,
): (props: TAmountLimitsRuleInfo) => Promise<boolean> {
    const subscribeToConvertRates = useModule(ModuleSubscribeToConvertRatesOnCurrentStage);
    const { confirm } = useModule(ModuleModals);

    const [deleteAmountLimitsRule] = useNotifiedObservableFunction(
        useModule(ModuleDeleteLimitingTransferRuleOnCurrentStage),
        DELETE_OPTIONS,
    );
    const convertRates = useNotifiedValueDescriptorObservable(
        subscribeToConvertRates(undefined, { traceId }),
    );

    return useFunction(async (props: TAmountLimitsRuleInfo): Promise<boolean> => {
        const convertRate = isSyncedValueDescriptor(convertRates)
            ? convertRates.value.get(props.amountCurrency)
            : undefined;

        const approvedDeletion = await confirm('', {
            title: 'Delete Amount Limits Rule?',
            width: '650px',
            content: <AmountLimitsRuleConfirmation {...props} convertRate={convertRate} />,
        });

        if (!approvedDeletion) {
            return false;
        }

        return deleteAmountLimitsRule(props.id, { traceId });
    });
}
