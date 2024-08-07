import type { TraceId } from '@common/utils';
import { useModule } from '@frontend/common/src/di/react';
import { ModuleModals } from '@frontend/common/src/lib/modals';
import type { TAutoTransferRuleInfo } from '@frontend/common/src/types/domain/balanceMonitor/defs';
import { useFunction } from '@frontend/common/src/utils/React/useFunction.ts';
import { useNotifiedObservableFunction } from '@frontend/common/src/utils/React/useObservableFunction.ts';

import { ModuleDeleteAutoTransferRuleOnCurrentStage } from '../../modules/actions/ModuleDeleteAutoTransferRuleOnCurrentStage.ts';
import { AutoTransferRuleConfirmation } from './components/AutoTransferRuleConfirmation';

export function useConnectedDeleteAutoTransferRule(
    traceId: TraceId,
): (props: TAutoTransferRuleInfo) => Promise<boolean> {
    const { confirm } = useModule(ModuleModals);

    const [deleteRule] = useNotifiedObservableFunction(
        useModule(ModuleDeleteAutoTransferRuleOnCurrentStage),
        {
            mapError: () => ({ message: 'Failed to delete auto transfer rule' }),
            getNotifyTitle: () => ({
                loading: 'Deleting Auto Transfer Rule',
                success: 'Auto transfer rule deleted successfully',
            }),
        },
    );

    return useFunction(async (props: TAutoTransferRuleInfo) => {
        const approvedDeletion = await confirm('', {
            title: 'Delete Auto Transfer Rule?',
            width: '650px',
            content: <AutoTransferRuleConfirmation {...props} />,
        });

        if (!approvedDeletion) {
            return false;
        }

        return deleteRule(props.id, { traceId });
    });
}
