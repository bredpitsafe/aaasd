import { Descriptions } from '@frontend/common/src/components/Descriptions';
import { useModule } from '@frontend/common/src/di/react';
import { ModuleModals } from '@frontend/common/src/lib/modals';
import type { TCoinId, TExchangeId } from '@frontend/common/src/types/domain/balanceMonitor/defs';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import type { TraceId } from '@frontend/common/src/utils/traceId';
import { isFailDesc, isSyncDesc } from '@frontend/common/src/utils/ValueDescriptor';
import { useState } from 'react';
import { useMountedState } from 'react-use';
import { firstValueFrom } from 'rxjs';
import { first } from 'rxjs/operators';

import { ModuleStopGatheringAction } from '../../modules/actions/ModuleStopGatheringAction';
import { CoinWithIcon } from '../CoinWithIcon';
import { ExchangeWithIcon } from '../ExchangeWithIcon';

export function useConnectedStopGathering(
    traceId: TraceId,
): [(exchange: TExchangeId, coin: TCoinId) => Promise<boolean>, boolean] {
    const { stopGathering } = useModule(ModuleStopGatheringAction);
    const { confirm } = useModule(ModuleModals);

    const isMounted = useMountedState();
    const [stopGatheringInProgress, setStopGatheringInProgress] = useState(false);

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

            setStopGatheringInProgress(true);

            const result = await firstValueFrom(
                stopGathering(exchange, coin, traceId).pipe(
                    first(
                        (valueDescriptor) =>
                            isSyncDesc(valueDescriptor) || isFailDesc(valueDescriptor),
                    ),
                ),
            );

            if (isMounted()) {
                setStopGatheringInProgress(false);
            }

            return isSyncDesc(result);
        },
    );

    return [stopGatheringWithConfirmation, stopGatheringInProgress];
}
