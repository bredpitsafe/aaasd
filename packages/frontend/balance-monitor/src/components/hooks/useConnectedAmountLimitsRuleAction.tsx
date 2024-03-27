import { useModule } from '@frontend/common/src/di/react';
import { ModuleModals } from '@frontend/common/src/lib/modals';
import type {
    TAmountLimitsRuleCreate,
    TAmountLimitsRuleUpdate,
} from '@frontend/common/src/types/domain/balanceMonitor/defs';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { useSyncObservable } from '@frontend/common/src/utils/React/useSyncObservable';
import type { TraceId } from '@frontend/common/src/utils/traceId';
import { IdleDesc, isFailDesc, isSyncDesc } from '@frontend/common/src/utils/ValueDescriptor';
import { useMemo, useState } from 'react';
import { useMountedState } from 'react-use';
import { firstValueFrom } from 'rxjs';
import { first } from 'rxjs/operators';

import { ModuleSetAmountLimitsRuleAction } from '../../modules/actions/ModuleSetAmountLimitsRuleAction';
import { ModuleConvertRates } from '../../modules/observables/ModuleConvertRates';
import { AmountLimitsRuleConfirmation } from './components/AmountLimitsRuleConfirmation';

export function useConnectedAmountLimitsRuleAction(
    onUpsertedAmountLimitsRule: VoidFunction | undefined,
    traceId: TraceId,
): [(props: TAmountLimitsRuleCreate | TAmountLimitsRuleUpdate) => Promise<boolean>, boolean] {
    const { getConvertRates$ } = useModule(ModuleConvertRates);
    const { setAmountLimitsRule } = useModule(ModuleSetAmountLimitsRuleAction);
    const { confirm } = useModule(ModuleModals);

    const convertRates = useSyncObservable(
        getConvertRates$(traceId),
        useMemo(() => IdleDesc(), []),
    );

    const isMounted = useMountedState();
    const [createInProgress, setCreateInProgress] = useState(false);

    const createWithConfirmation = useFunction(
        async (props: TAmountLimitsRuleCreate | TAmountLimitsRuleUpdate): Promise<boolean> => {
            const convertRate = isSyncDesc(convertRates)
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

            setCreateInProgress(true);

            const result = await firstValueFrom(
                setAmountLimitsRule(props, traceId).pipe(
                    first(
                        (valueDescriptor) =>
                            isSyncDesc(valueDescriptor) || isFailDesc(valueDescriptor),
                    ),
                ),
            );

            if (isMounted()) {
                setCreateInProgress(false);
            }

            if (isSyncDesc(result)) {
                onUpsertedAmountLimitsRule?.();
                return true;
            }

            return false;
        },
    );

    return [createWithConfirmation, createInProgress];
}
