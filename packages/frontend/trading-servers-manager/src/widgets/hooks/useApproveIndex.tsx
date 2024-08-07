import type { TIndex } from '@backend/bff/src/modules/instruments/schemas/defs.ts';
import { generateTraceId } from '@common/utils';
import { useModule } from '@frontend/common/src/di/react';
import { ModuleModals } from '@frontend/common/src/lib/modals.tsx';
import { ModuleApproveIndexOnCurrentStage } from '@frontend/common/src/modules/instruments/ModuleApproveIndexOnCurrentStage.ts';
import { useFunction } from '@frontend/common/src/utils/React/useFunction.ts';
import { useNotifiedObservableFunction } from '@frontend/common/src/utils/React/useObservableFunction.ts';

export function useApproveIndex(): (index: TIndex) => Promise<boolean> {
    const approveIndexOnCurrentStage = useModule(ModuleApproveIndexOnCurrentStage);

    const { confirm } = useModule(ModuleModals);

    const [approveIndex] = useNotifiedObservableFunction(
        (index: TIndex) => approveIndexOnCurrentStage(index.name, { traceId: generateTraceId() }),
        {
            mapError: () => ({ message: 'Failed to approve index' }),
            getNotifyTitle: (index) => ({
                loading: `Approving index "${index.name}"`,
                success: `Successfully approved index "${index.name}"`,
            }),
        },
    );

    return useFunction(async (index: TIndex): Promise<boolean> => {
        const approved = await confirm('', {
            title: 'Approve Index',
            width: '650px',
            content: (
                <p>
                    Are you sure you want to approve index &quot;{index.name}
                    &quot;?
                </p>
            ),
        });

        if (!approved) {
            return false;
        }

        return approveIndex(index);
    });
}
