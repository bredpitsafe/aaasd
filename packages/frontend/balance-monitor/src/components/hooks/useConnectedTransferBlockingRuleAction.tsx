import { useTimeZoneInfoSettings } from '@frontend/common/src/components/Settings/hooks/useTimeZoneSettings';
import { useModule } from '@frontend/common/src/di/react';
import { ModuleModals } from '@frontend/common/src/lib/modals';
import { EApplicationName } from '@frontend/common/src/types/app';
import type {
    TTransferBlockingRuleCreate,
    TTransferBlockingRuleUpdate,
} from '@frontend/common/src/types/domain/balanceMonitor/defs';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import type { TraceId } from '@frontend/common/src/utils/traceId';
import { isFailDesc, isSyncDesc } from '@frontend/common/src/utils/ValueDescriptor';
import { useState } from 'react';
import { useMountedState } from 'react-use';
import { firstValueFrom } from 'rxjs';
import { first } from 'rxjs/operators';

import { ModuleSetTransferBlockingRuleAction } from '../../modules/actions/ModuleSetTransferBlockingRuleAction';
import { TransferBlockingRuleConfirmation } from './components/TransferBlockingRuleConfirmation';

export function useConnectedTransferBlockingRuleAction(
    onUpsertedTransferBlockingRule: VoidFunction | undefined,
    traceId: TraceId,
): [
    (props: TTransferBlockingRuleCreate | TTransferBlockingRuleUpdate) => Promise<boolean>,
    boolean,
] {
    const { setTransferBlockingRule } = useModule(ModuleSetTransferBlockingRuleAction);
    const { confirm } = useModule(ModuleModals);
    const [{ timeZone }] = useTimeZoneInfoSettings(EApplicationName.BalanceMonitor);

    const isMounted = useMountedState();
    const [createInProgress, setCreateInProgress] = useState(false);

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

            setCreateInProgress(true);

            const result = await firstValueFrom(
                setTransferBlockingRule(props, traceId).pipe(
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
                onUpsertedTransferBlockingRule?.();
                return true;
            }

            return false;
        },
    );

    return [createWithConfirmation, createInProgress];
}
