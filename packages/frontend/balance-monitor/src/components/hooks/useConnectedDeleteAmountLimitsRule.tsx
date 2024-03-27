import { useModule } from '@frontend/common/src/di/react';
import { ModuleModals } from '@frontend/common/src/lib/modals';
import type { TAmountLimitsRuleInfo } from '@frontend/common/src/types/domain/balanceMonitor/defs';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { useSyncObservable } from '@frontend/common/src/utils/React/useSyncObservable';
import type { TraceId } from '@frontend/common/src/utils/traceId';
import { IdleDesc, isFailDesc, isSyncDesc } from '@frontend/common/src/utils/ValueDescriptor';
import { useMemo } from 'react';
import { firstValueFrom } from 'rxjs';
import { first } from 'rxjs/operators';

import { ModuleDeleteAmountLimitsRuleAction } from '../../modules/actions/ModuleDeleteAmountLimitsRuleAction';
import { ModuleConvertRates } from '../../modules/observables/ModuleConvertRates';
import { AmountLimitsRuleConfirmation } from './components/AmountLimitsRuleConfirmation';

export function useConnectedDeleteAmountLimitsRule(
    traceId: TraceId,
): (props: TAmountLimitsRuleInfo) => Promise<boolean> {
    const { getConvertRates$ } = useModule(ModuleConvertRates);
    const { deleteAmountLimitsRule } = useModule(ModuleDeleteAmountLimitsRuleAction);
    const { confirm } = useModule(ModuleModals);

    const convertRates = useSyncObservable(
        getConvertRates$(traceId),
        useMemo(() => IdleDesc(), []),
    );

    return useFunction(async (props: TAmountLimitsRuleInfo): Promise<boolean> => {
        const convertRate = isSyncDesc(convertRates)
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

        return isSyncDesc(
            await firstValueFrom(
                deleteAmountLimitsRule(props.id, traceId).pipe(
                    first(
                        (valueDescriptor) =>
                            isSyncDesc(valueDescriptor) || isFailDesc(valueDescriptor),
                    ),
                ),
            ),
        );
    });
}
