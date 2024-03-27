import { useModule } from '@frontend/common/src/di/react';
import { ModuleModals } from '@frontend/common/src/lib/modals';
import type { TAutoTransferRuleInfo } from '@frontend/common/src/types/domain/balanceMonitor/defs';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import type { TraceId } from '@frontend/common/src/utils/traceId';
import { isFailDesc, isSyncDesc } from '@frontend/common/src/utils/ValueDescriptor';
import { firstValueFrom } from 'rxjs';
import { first } from 'rxjs/operators';

import { ModuleDeleteAutoTransferRuleAction } from '../../modules/actions/ModuleDeleteAutoTransferRuleAction';
import { AutoTransferRuleConfirmation } from './components/AutoTransferRuleConfirmation';

export function useConnectedDeleteAutoTransferRule(
    traceId: TraceId,
): (props: TAutoTransferRuleInfo) => Promise<boolean> {
    const { deleteAutoTransferRule } = useModule(ModuleDeleteAutoTransferRuleAction);
    const { confirm } = useModule(ModuleModals);

    return useFunction(async (props: TAutoTransferRuleInfo): Promise<boolean> => {
        const approvedDeletion = await confirm('', {
            title: 'Delete Auto Transfer Rule?',
            width: '650px',
            content: <AutoTransferRuleConfirmation {...props} />,
        });

        if (!approvedDeletion) {
            return false;
        }

        return isSyncDesc(
            await firstValueFrom(
                deleteAutoTransferRule(props.id, traceId).pipe(
                    first(
                        (valueDescriptor) =>
                            isSyncDesc(valueDescriptor) || isFailDesc(valueDescriptor),
                    ),
                ),
            ),
        );
    });
}
