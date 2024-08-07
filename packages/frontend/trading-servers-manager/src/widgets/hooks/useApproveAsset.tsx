import type { TAsset } from '@backend/bff/src/modules/instruments/schemas/defs.ts';
import { generateTraceId } from '@common/utils';
import { useModule } from '@frontend/common/src/di/react';
import { ModuleModals } from '@frontend/common/src/lib/modals.tsx';
import { ModuleApproveAssetOnCurrentStage } from '@frontend/common/src/modules/instruments/ModuleApproveAssetOnCurrentStage.ts';
import { useFunction } from '@frontend/common/src/utils/React/useFunction.ts';
import { useNotifiedObservableFunction } from '@frontend/common/src/utils/React/useObservableFunction.ts';

export function useApproveAsset(): (asset: TAsset) => Promise<boolean> {
    const approveAssetOnCurrentStage = useModule(ModuleApproveAssetOnCurrentStage);

    const { confirm } = useModule(ModuleModals);

    const [approveAsset] = useNotifiedObservableFunction(
        (asset: TAsset) => approveAssetOnCurrentStage(asset.name, { traceId: generateTraceId() }),
        {
            mapError: () => ({ message: 'Failed to approve asset' }),
            getNotifyTitle: (asset) => ({
                loading: `Approving asset "${asset.name}"`,
                success: `Successfully approved asset "${asset.name}"`,
            }),
        },
    );

    return useFunction(async (asset: TAsset): Promise<boolean> => {
        const approved = await confirm('', {
            title: 'Approve Asset',
            width: '650px',
            content: (
                <p>
                    Are you sure you want to approve asset &quot;{asset.name}
                    &quot;?
                </p>
            ),
        });

        if (!approved) {
            return false;
        }

        return approveAsset(asset);
    });
}
