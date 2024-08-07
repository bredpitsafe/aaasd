import type { TraceId } from '@common/utils';
import { Descriptions } from '@frontend/common/src/components/Descriptions';
import { useModule } from '@frontend/common/src/di/react';
import { ModuleModals } from '@frontend/common/src/lib/modals';
import type {
    TAmount,
    TCoinId,
    TExchangeId,
} from '@frontend/common/src/types/domain/balanceMonitor/defs';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { useNotifiedObservableFunction } from '@frontend/common/src/utils/React/useObservableFunction.ts';
import { useNotifiedValueDescriptorObservable } from '@frontend/common/src/utils/React/useValueDescriptorObservable.ts';
import { isSyncedValueDescriptor } from '@frontend/common/src/utils/ValueDescriptor/utils.ts';

import { ModuleStartGatheringOnCurrentStage } from '../../modules/actions/ModuleStartGatheringOnCurrentStage.ts';
import { ModuleSubscribeToConvertRatesOnCurrentStage } from '../../modules/actions/ModuleSubscribeToConvertRatesOnCurrentStage.ts';
import { AmountWithUsdAmount } from '../AmountWithUsdAmount';
import { CoinWithIcon } from '../CoinWithIcon';
import { ExchangeWithIcon } from '../ExchangeWithIcon';

export function useConnectedStartGathering(
    traceId: TraceId,
): [(exchange: TExchangeId, coin: TCoinId, amount: TAmount) => Promise<boolean>, boolean] {
    const subscribeToConvertRates = useModule(ModuleSubscribeToConvertRatesOnCurrentStage);

    const { confirm } = useModule(ModuleModals);

    const convertRates = useNotifiedValueDescriptorObservable(
        subscribeToConvertRates(undefined, { traceId }),
    );

    const [startGathering, , , startGatheringProgress] = useNotifiedObservableFunction(
        useModule(ModuleStartGatheringOnCurrentStage),
        {
            mapError: () => ({ message: 'Failed to start gathering' }),
            getNotifyTitle: () => ({
                loading: 'Starting gathering',
                success: 'Gathering started successfully',
            }),
        },
    );

    const startGatheringWithConfirmation = useFunction(
        async (exchange: TExchangeId, coin: TCoinId, amount: TAmount): Promise<boolean> => {
            const convertRate = isSyncedValueDescriptor(convertRates)
                ? convertRates.value.get(coin)
                : undefined;

            const approvedTransfer = await confirm('', {
                title: 'Start Gathering confirmation',
                width: '600px',
                content: (
                    <Descriptions bordered layout="horizontal" column={1} size="small">
                        <Descriptions.Item label="Exchange">
                            <ExchangeWithIcon exchange={exchange} />
                        </Descriptions.Item>
                        <Descriptions.Item label="Coin">
                            <CoinWithIcon coin={coin} />
                        </Descriptions.Item>
                        <Descriptions.Item label="Amount">
                            <AmountWithUsdAmount
                                amount={amount}
                                coin={coin}
                                convertRate={convertRate}
                            />
                        </Descriptions.Item>
                    </Descriptions>
                ),
            });

            if (!approvedTransfer) {
                return false;
            }

            return startGathering({ exchange, coin, amount }, { traceId });
        },
    );

    return [startGatheringWithConfirmation, startGatheringProgress];
}
