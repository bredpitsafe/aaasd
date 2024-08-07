import type { TraceId } from '@common/utils';
import { useModule } from '@frontend/common/src/di/react';
import type { TCoinId } from '@frontend/common/src/types/domain/balanceMonitor/defs';
import { useNotifiedObservableFunction } from '@frontend/common/src/utils/React/useObservableFunction.ts';

import { ModuleSaveCoinStateOnCurrentStage } from '../../modules/actions/ModuleSaveCoinStateOnCurrentStage.ts';

export function useConnectedSaveCoinStateTransfer(
    traceId: TraceId,
): (coin: TCoinId, comment: string) => Promise<true> {
    const saveCoinState = useModule(ModuleSaveCoinStateOnCurrentStage);
    const [save] = useNotifiedObservableFunction(
        (coin: TCoinId, comment: string) => saveCoinState({ coin, comment }, { traceId }),
        {
            mapError: () => ({ message: 'Failed to save coin state' }),
            getNotifyTitle: () => ({
                loading: 'Saving coin state',
                success: 'Coin state saved successfully',
            }),
        },
    );

    return save;
}
