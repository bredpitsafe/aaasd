import { useSyncedTableFilter } from '@frontend/common/src/components/AgTable/hooks/useSyncedTableFilter.ts';
import { useModule } from '@frontend/common/src/di/react';
import { useTraceId } from '@frontend/common/src/hooks/useTraceId';
import { ETableIds } from '@frontend/common/src/modules/clientTableFilters/data';
import type { TCoinId } from '@frontend/common/src/types/domain/balanceMonitor/defs';
import { useNotifiedValueDescriptorObservable } from '@frontend/common/src/utils/React/useValueDescriptorObservable.ts';
import { EMPTY } from 'rxjs';

import { TableCoinTransferDetails } from '../../components/Tables/TableCoinTransferDetails/view';
import { ModuleCoinTransferDetails } from '../../modules/actions/ModuleCoinTransferDetails.ts';
import { ModuleSubscribeToCoinInfoOnCurrentStage } from '../../modules/actions/ModuleSubscribeToCoinInfoOnCurrentStage.ts';
import { ModuleSubscribeToConvertRatesOnCurrentStage } from '../../modules/actions/ModuleSubscribeToConvertRatesOnCurrentStage.ts';

export function WidgetCoinTransferDetails() {
    const traceId = useTraceId();
    const { getCoinTransferDetails$, refreshCoinTransferDetails } =
        useModule(ModuleCoinTransferDetails);
    const subscribeToCoinInfo = useModule(ModuleSubscribeToCoinInfoOnCurrentStage);
    const subscribeToConvertRates = useModule(ModuleSubscribeToConvertRatesOnCurrentStage);

    const [selectedCoin, setSelectedCoin] = useSyncedTableFilter<TCoinId | undefined>(
        `${ETableIds.CoinTransferDetails}_COIN`,
        'coin',
    );

    const coinTransferDetails = useNotifiedValueDescriptorObservable(
        selectedCoin === undefined ? EMPTY : getCoinTransferDetails$(selectedCoin, traceId),
    );

    const coinInfo = useNotifiedValueDescriptorObservable(
        subscribeToCoinInfo(undefined, { traceId }),
    );
    const convertRates = useNotifiedValueDescriptorObservable(
        subscribeToConvertRates(undefined, { traceId }),
    );

    return (
        <TableCoinTransferDetails
            coinTransferDetailsDescriptor={coinTransferDetails}
            coinInfoDescriptor={coinInfo}
            convertRatesDescriptor={convertRates}
            refreshCoinTransferDetails={refreshCoinTransferDetails}
            selectedCoin={selectedCoin}
            onSelectCoin={setSelectedCoin}
        />
    );
}
