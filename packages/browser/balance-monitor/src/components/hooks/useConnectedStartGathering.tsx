import { Descriptions } from '@frontend/common/src/components/Descriptions';
import { useModule } from '@frontend/common/src/di/react';
import { ModuleModals } from '@frontend/common/src/lib/modals';
import type {
    TAmount,
    TCoinId,
    TExchangeId,
} from '@frontend/common/src/types/domain/balanceMonitor/defs';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { useSyncObservable } from '@frontend/common/src/utils/React/useSyncObservable';
import type { TraceId } from '@frontend/common/src/utils/traceId';
import { IdleDesc, isFailDesc, isSyncDesc } from '@frontend/common/src/utils/ValueDescriptor';
import { useMemo, useState } from 'react';
import { useMountedState } from 'react-use';
import { firstValueFrom } from 'rxjs';
import { first } from 'rxjs/operators';

import { ModuleStartGatheringAction } from '../../modules/actions/ModuleStartGatheringAction';
import { ModuleConvertRates } from '../../modules/observables/ModuleConvertRates';
import { AmountWithUsdAmount } from '../AmountWithUsdAmount';
import { CoinWithIcon } from '../CoinWithIcon';
import { ExchangeWithIcon } from '../ExchangeWithIcon';

export function useConnectedStartGathering(
    traceId: TraceId,
): [(exchange: TExchangeId, coin: TCoinId, amount: TAmount) => Promise<boolean>, boolean] {
    const { getConvertRates$ } = useModule(ModuleConvertRates);
    const { startGathering } = useModule(ModuleStartGatheringAction);
    const { confirm } = useModule(ModuleModals);

    const convertRates = useSyncObservable(
        getConvertRates$(traceId),
        useMemo(() => IdleDesc(), []),
    );

    const isMounted = useMountedState();
    const [startGatheringInProgress, setStartGatheringInProgress] = useState(false);

    const startGatheringWithConfirmation = useFunction(
        async (exchange: TExchangeId, coin: TCoinId, amount: TAmount): Promise<boolean> => {
            const convertRate = isSyncDesc(convertRates) ? convertRates.value.get(coin) : undefined;

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

            setStartGatheringInProgress(true);

            const result = await firstValueFrom(
                startGathering(exchange, coin, amount, traceId).pipe(
                    first(
                        (valueDescriptor) =>
                            isSyncDesc(valueDescriptor) || isFailDesc(valueDescriptor),
                    ),
                ),
            );

            if (isMounted()) {
                setStartGatheringInProgress(false);
            }

            return isSyncDesc(result);
        },
    );

    return [startGatheringWithConfirmation, startGatheringInProgress];
}
