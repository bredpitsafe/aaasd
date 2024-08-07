import type { TraceId } from '@common/utils';
import { useModule } from '@frontend/common/src/di/react';
import { ModuleModals } from '@frontend/common/src/lib/modals';
import type {
    TAmountLimitsRuleCreate,
    TAmountLimitsRuleUpdate,
} from '@frontend/common/src/types/domain/balanceMonitor/defs';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { useNotifiedObservableFunction } from '@frontend/common/src/utils/React/useObservableFunction.ts';
import { useNotifiedValueDescriptorObservable } from '@frontend/common/src/utils/React/useValueDescriptorObservable.ts';
import {
    isLoadingValueDescriptor,
    isSyncedValueDescriptor,
} from '@frontend/common/src/utils/ValueDescriptor/utils.ts';

import { ModuleSetAmountLimitsRuleOnCurrentStage } from '../../modules/actions/ModuleSetAmountLimitsRuleOnCurrentStage.ts';
import { ModuleSubscribeToConvertRatesOnCurrentStage } from '../../modules/actions/ModuleSubscribeToConvertRatesOnCurrentStage.ts';
import { AmountLimitsRuleConfirmation } from './components/AmountLimitsRuleConfirmation';

export function useConnectedAmountLimitsRuleAction(
    onUpsertedAmountLimitsRule: VoidFunction | undefined,
    traceId: TraceId,
): [(props: TAmountLimitsRuleCreate | TAmountLimitsRuleUpdate) => Promise<boolean>, boolean] {
    const subscribeToConvertRates = useModule(ModuleSubscribeToConvertRatesOnCurrentStage);
    const setAmountLimitsRule = useModule(ModuleSetAmountLimitsRuleOnCurrentStage);
    const { confirm } = useModule(ModuleModals);

    const convertRates = useNotifiedValueDescriptorObservable(
        subscribeToConvertRates(undefined, { traceId }),
    );

    const [setAmountWithNotify, setAmountProgress] = useNotifiedObservableFunction(
        setAmountLimitsRule,
        {
            mapError: () => ({ message: 'Failed to create amount limits rule' }),
            getNotifyTitle: (props) => ({
                loading: `${'id' in props ? 'Updating' : 'Creating'} amount limits rule...`,
                success: `Amount limits rule ${'id' in props ? 'updated' : 'created'} successfully`,
            }),
        },
    );

    const createWithConfirmation = useFunction(
        async (props: TAmountLimitsRuleCreate | TAmountLimitsRuleUpdate): Promise<boolean> => {
            const convertRate = isSyncedValueDescriptor(convertRates)
                ? convertRates.value.get(props.amountCurrency)
                : undefined;

            const approvedTransfer = await confirm('', {
                title: 'id' in props ? 'Update Amount Limits Rule?' : 'Create Amount Limits Rule?',
                width: '650px',
                content: <AmountLimitsRuleConfirmation {...props} convertRate={convertRate} />,
            });

            if (!approvedTransfer) {
                return false;
            }

            await setAmountWithNotify(props, { traceId });

            onUpsertedAmountLimitsRule?.();

            return true;
        },
    );

    return [createWithConfirmation, isLoadingValueDescriptor(setAmountProgress)];
}
