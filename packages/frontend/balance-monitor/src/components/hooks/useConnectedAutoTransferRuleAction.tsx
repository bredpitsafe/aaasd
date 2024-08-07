import type { TraceId } from '@common/utils';
import { useModule } from '@frontend/common/src/di/react';
import { ModuleModals } from '@frontend/common/src/lib/modals';
import type {
    TAutoTransferRuleCreate,
    TAutoTransferRuleUpdate,
} from '@frontend/common/src/types/domain/balanceMonitor/defs';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { useNotifiedObservableFunction } from '@frontend/common/src/utils/React/useObservableFunction.ts';
import { isLoadingValueDescriptor } from '@frontend/common/src/utils/ValueDescriptor/utils.ts';

import { ModuleSetAutoTransferRuleOnCurrentStage } from '../../modules/actions/ModuleSetAutoTransferRuleOnCurrentStage.ts';
import { AutoTransferRuleConfirmation } from './components/AutoTransferRuleConfirmation';

export function useConnectedAutoTransferRuleAction(
    onUpsertedAutoTransferRule: VoidFunction | undefined,
    traceId: TraceId,
): [(props: TAutoTransferRuleCreate | TAutoTransferRuleUpdate) => Promise<boolean>, boolean] {
    const { confirm } = useModule(ModuleModals);
    const [setAutoTransfer, setAutoTransferProgress] = useNotifiedObservableFunction(
        useModule(ModuleSetAutoTransferRuleOnCurrentStage),
        {
            mapError: () => ({ message: 'Failed to create auto transfer rule' }),
            getNotifyTitle: (props) => ({
                loading: `${'id' in props ? 'Updating' : 'Creating'} auto transfer rule...`,
                success: `Auto transfer rule ${'id' in props ? 'updated' : 'created'} successfully`,
            }),
        },
    );

    const createWithConfirmation = useFunction(
        async (props: TAutoTransferRuleCreate | TAutoTransferRuleUpdate): Promise<boolean> => {
            const approvedTransfer = await confirm('', {
                title: 'id' in props ? 'Update Auto Transfer Rule?' : 'Create Auto Transfer Rule?',
                width: '650px',
                content: <AutoTransferRuleConfirmation {...props} />,
            });

            if (!approvedTransfer) {
                return false;
            }

            await setAutoTransfer(props, { traceId });

            onUpsertedAutoTransferRule?.();

            return true;
        },
    );

    return [createWithConfirmation, isLoadingValueDescriptor(setAutoTransferProgress)];
}
