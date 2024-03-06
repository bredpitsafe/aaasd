import { useTimeZoneInfoSettings } from '@frontend/common/src/components/Settings/hooks/useTimeZoneSettings';
import { useModule } from '@frontend/common/src/di/react';
import { ModuleModals } from '@frontend/common/src/lib/modals';
import { EApplicationName } from '@frontend/common/src/types/app';
import type { TTransferBlockingRuleInfo } from '@frontend/common/src/types/domain/balanceMonitor/defs';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import type { TraceId } from '@frontend/common/src/utils/traceId';
import { isFailDesc, isSyncDesc } from '@frontend/common/src/utils/ValueDescriptor';
import { firstValueFrom } from 'rxjs';
import { first } from 'rxjs/operators';

import { ModuleDeleteTransferBlockingRuleAction } from '../../modules/actions/ModuleDeleteTransferBlockingRuleAction';
import { TransferBlockingRuleConfirmation } from './components/TransferBlockingRuleConfirmation';

export function useConnectedDeleteTransferBlockingRule(
    traceId: TraceId,
): (props: TTransferBlockingRuleInfo) => Promise<boolean> {
    const { deleteTransferBlockingRule } = useModule(ModuleDeleteTransferBlockingRuleAction);
    const { confirm } = useModule(ModuleModals);
    const [{ timeZone }] = useTimeZoneInfoSettings(EApplicationName.BalanceMonitor);

    return useFunction(async (props: TTransferBlockingRuleInfo): Promise<boolean> => {
        const approvedDeletion = await confirm('', {
            title: 'Delete Transfer Blocking Rule?',
            width: '650px',
            content: <TransferBlockingRuleConfirmation {...props} timeZone={timeZone} />,
        });

        if (!approvedDeletion) {
            return false;
        }

        return isSyncDesc(
            await firstValueFrom(
                deleteTransferBlockingRule(props.id, traceId).pipe(
                    first(
                        (valueDescriptor) =>
                            isSyncDesc(valueDescriptor) || isFailDesc(valueDescriptor),
                    ),
                ),
            ),
        );
    });
}
