import type { TraceId } from '@common/utils';
import { useTimeZoneInfoSettings } from '@frontend/common/src/components/Settings/hooks/useTimeZoneSettings';
import { useModule } from '@frontend/common/src/di/react';
import { ModuleModals } from '@frontend/common/src/lib/modals';
import type {
    TTransferBlockingRuleCreate,
    TTransferBlockingRuleUpdate,
} from '@frontend/common/src/types/domain/balanceMonitor/defs';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { useNotifiedObservableFunction } from '@frontend/common/src/utils/React/useObservableFunction.ts';
import { isLoadingValueDescriptor } from '@frontend/common/src/utils/ValueDescriptor/utils.ts';

import { ModuleSetTransferBlockingRuleOnCurrentStage } from '../../modules/actions/ModuleSetTransferBlockingRuleOnCurrentStage.ts';
import { TransferBlockingRuleConfirmation } from './components/TransferBlockingRuleConfirmation';

export function useConnectedTransferBlockingRuleAction(
    onUpsertedTransferBlockingRule: VoidFunction | undefined,
    traceId: TraceId,
): [
    (props: TTransferBlockingRuleCreate | TTransferBlockingRuleUpdate) => Promise<boolean>,
    boolean,
] {
    const { confirm } = useModule(ModuleModals);
    const [{ timeZone }] = useTimeZoneInfoSettings();

    const [setTransferBlockingRule, setTransferBlockingRuleProgress] =
        useNotifiedObservableFunction(useModule(ModuleSetTransferBlockingRuleOnCurrentStage), {
            mapError: () => ({ message: 'Failed to create transfer blocking rule' }),
            getNotifyTitle: (props) => ({
                loading: `${'id' in props ? 'Updating' : 'Creating'} transfer blocking rule...`,
                success: `Transfer blocking rule ${
                    'id' in props ? 'updated' : 'created'
                } successfully`,
            }),
        });

    const createWithConfirmation = useFunction(
        async (
            props: TTransferBlockingRuleCreate | TTransferBlockingRuleUpdate,
        ): Promise<boolean> => {
            const approvedTransfer = await confirm('', {
                title:
                    'id' in props
                        ? 'Update Transfer Blocking Rule?'
                        : 'Create Transfer Blocking Rule?',
                width: '650px',
                content: <TransferBlockingRuleConfirmation {...props} timeZone={timeZone} />,
            });

            if (!approvedTransfer) {
                return false;
            }

            await setTransferBlockingRule(props, { traceId });

            onUpsertedTransferBlockingRule?.();

            return true;
        },
    );

    return [createWithConfirmation, isLoadingValueDescriptor(setTransferBlockingRuleProgress)];
}
