import type { TraceId } from '@common/utils';
import { useTimeZoneInfoSettings } from '@frontend/common/src/components/Settings/hooks/useTimeZoneSettings';
import { useModule } from '@frontend/common/src/di/react';
import { ModuleModals } from '@frontend/common/src/lib/modals';
import type { TTransferBlockingRuleInfo } from '@frontend/common/src/types/domain/balanceMonitor/defs';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { useNotifiedObservableFunction } from '@frontend/common/src/utils/React/useObservableFunction.ts';

import { ModuleDeleteTransferBlockingRuleOnCurrentStage } from '../../modules/actions/ModuleDeleteTransferBlockingRuleOnCurrentStage.ts';
import { TransferBlockingRuleConfirmation } from './components/TransferBlockingRuleConfirmation';

export function useConnectedDeleteTransferBlockingRule(
    traceId: TraceId,
): (props: TTransferBlockingRuleInfo) => Promise<boolean> {
    const { confirm } = useModule(ModuleModals);
    const [{ timeZone }] = useTimeZoneInfoSettings();

    const [deleteRule] = useNotifiedObservableFunction(
        useModule(ModuleDeleteTransferBlockingRuleOnCurrentStage),
        {
            mapError: () => ({ message: 'Failed to delete transfer blocking rule' }),
            getNotifyTitle: () => ({
                loading: 'Deleting Transfer Blocking Rule',
                success: 'Transfer blocking rule deleted successfully',
            }),
        },
    );

    return useFunction(async (props: TTransferBlockingRuleInfo): Promise<boolean> => {
        const approvedDeletion = await confirm('', {
            title: 'Delete Transfer Blocking Rule?',
            width: '650px',
            content: <TransferBlockingRuleConfirmation {...props} timeZone={timeZone} />,
        });

        if (!approvedDeletion) {
            return false;
        }

        return deleteRule(props.id, { traceId });
    });
}
