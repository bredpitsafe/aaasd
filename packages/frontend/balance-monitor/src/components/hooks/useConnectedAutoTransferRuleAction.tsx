import { useModule } from '@frontend/common/src/di/react';
import { ModuleModals } from '@frontend/common/src/lib/modals';
import type {
    TAutoTransferRuleCreate,
    TAutoTransferRuleUpdate,
} from '@frontend/common/src/types/domain/balanceMonitor/defs';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import type { TraceId } from '@frontend/common/src/utils/traceId';
import { isFailDesc, isSyncDesc } from '@frontend/common/src/utils/ValueDescriptor';
import { useState } from 'react';
import { useMountedState } from 'react-use';
import { firstValueFrom } from 'rxjs';
import { first } from 'rxjs/operators';

import { ModuleSetAutoTransferRuleAction } from '../../modules/actions/ModuleSetAutoTransferRuleAction';
import { AutoTransferRuleConfirmation } from './components/AutoTransferRuleConfirmation';

export function useConnectedAutoTransferRuleAction(
    onUpsertedAutoTransferRule: VoidFunction | undefined,
    traceId: TraceId,
): [(props: TAutoTransferRuleCreate | TAutoTransferRuleUpdate) => Promise<boolean>, boolean] {
    const { setAutoTransferRule } = useModule(ModuleSetAutoTransferRuleAction);
    const { confirm } = useModule(ModuleModals);

    const isMounted = useMountedState();
    const [createInProgress, setCreateInProgress] = useState(false);

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

            setCreateInProgress(true);

            const result = await firstValueFrom(
                setAutoTransferRule(props, traceId).pipe(
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
                onUpsertedAutoTransferRule?.();
                return true;
            }

            return false;
        },
    );

    return [createWithConfirmation, createInProgress];
}
