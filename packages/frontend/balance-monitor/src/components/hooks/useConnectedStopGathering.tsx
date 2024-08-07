import type { TraceId } from '@common/utils';
import { Descriptions } from '@frontend/common/src/components/Descriptions';
import { useModule } from '@frontend/common/src/di/react';
import { ModuleModals } from '@frontend/common/src/lib/modals';
import type { TCoinId, TExchangeId } from '@frontend/common/src/types/domain/balanceMonitor/defs';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { useNotifiedObservableFunction } from '@frontend/common/src/utils/React/useObservableFunction.ts';

import { ModuleStopGatheringOnCurrentStage } from '../../modules/actions/ModuleStopGatheringOnCurrentStage.ts';
import { CoinWithIcon } from '../CoinWithIcon';
import { ExchangeWithIcon } from '../ExchangeWithIcon';

export function useConnectedStopGathering(
    traceId: TraceId,
): [(exchange: TExchangeId, coin: TCoinId) => Promise<boolean>, boolean] {
    const { confirm } = useModule(ModuleModals);

    const [stopGathering, , , stopGatheringInProgress] = useNotifiedObservableFunction(
        useModule(ModuleStopGatheringOnCurrentStage),
        {
            mapError: () => ({ message: 'Failed to stop gathering' }),
            getNotifyTitle: () => ({
                loading: 'Stopping gathering',
                success: 'Gathering stopped successfully',
            }),
        },
    );

    const stopGatheringWithConfirmation = useFunction(
        async (exchange: TExchangeId, coin: TCoinId): Promise<boolean> => {
            const approvedTransfer = await confirm('', {
                title: 'Stop Gathering confirmation',
                width: '600px',
                content: (
                    <Descriptions bordered layout="horizontal" column={1} size="small">
                        <Descriptions.Item label="Exchange">
                            <ExchangeWithIcon exchange={exchange} />
                        </Descriptions.Item>
                        <Descriptions.Item label="Coin">
                            <CoinWithIcon coin={coin} />
                        </Descriptions.Item>
                    </Descriptions>
                ),
            });

            if (!approvedTransfer) {
                return false;
            }

            return stopGathering({ exchange, coin }, { traceId });
        },
    );

    return [stopGatheringWithConfirmation, stopGatheringInProgress];
}
