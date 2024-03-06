import { useSyncedTableFilter } from '@frontend/common/src/components/Table/helpers/useSyncedTableFilter';
import { useModule } from '@frontend/common/src/di/react';
import { useTraceId } from '@frontend/common/src/hooks/useTraceId';
import { ETableIds } from '@frontend/common/src/modules/clientTableFilters/data';
import type { TCoinId } from '@frontend/common/src/types/domain/balanceMonitor/defs';
import { useSyncObservable } from '@frontend/common/src/utils/React/useSyncObservable';
import { UnscDesc } from '@frontend/common/src/utils/ValueDescriptor';
import { useMemo } from 'react';
import { EMPTY } from 'rxjs';

import { TableCoinTransferDetails } from '../../components/Tables/TableCoinTransferDetails/view';
import { ModuleCoinInfo } from '../../modules/observables/ModuleCoinInfo';
import { ModuleCoinTransferDetails } from '../../modules/observables/ModuleCoinTransferDetails';
import { ModuleConvertRates } from '../../modules/observables/ModuleConvertRates';

export function WidgetCoinTransferDetails() {
    const { getCoinTransferDetails$, refreshCoinTransferDetails } =
        useModule(ModuleCoinTransferDetails);
    const { getCoinInfo$ } = useModule(ModuleCoinInfo);
    const { getConvertRates$ } = useModule(ModuleConvertRates);

    const [selectedCoin, setSelectedCoin] = useSyncedTableFilter<TCoinId | undefined>(
        `${ETableIds.CoinTransferDetails}_COIN`,
        'coin',
    );

    const traceId = useTraceId();

    const coinTransferDetails = useSyncObservable(
        selectedCoin === undefined ? EMPTY : getCoinTransferDetails$(selectedCoin, traceId),
        useMemo(() => UnscDesc(null), []),
    );

    const coinInfo = useSyncObservable(
        getCoinInfo$(traceId),
        useMemo(() => UnscDesc(null), []),
    );
    const convertRates = useSyncObservable(
        getConvertRates$(traceId),
        useMemo(() => UnscDesc(null), []),
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
