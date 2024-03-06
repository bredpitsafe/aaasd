import { useModule } from '@frontend/common/src/di/react';
import { useTraceId } from '@frontend/common/src/hooks/useTraceId';
import { useSyncObservable } from '@frontend/common/src/utils/React/useSyncObservable';
import { UnscDesc } from '@frontend/common/src/utils/ValueDescriptor';
import { useMemo } from 'react';

import { useConnectedSaveCoinStateTransfer } from '../../components/hooks/useConnectedSaveCoinStateTransfer';
import { useConnectedTransferAction } from '../../components/hooks/useConnectedTransferAction';
import { RequestTransferContext } from '../../components/RequestTransferContext';
import { TableSuggestions } from '../../components/Tables/TableSuggestions/view';
import { EBalanceMonitorLayoutComponents } from '../../layouts/defs';
import { ModuleFillManualTransferAction } from '../../modules/actions/ModuleFillManualTransferAction';
import { ModuleCoinInfo } from '../../modules/observables/ModuleCoinInfo';
import { ModuleConvertRates } from '../../modules/observables/ModuleConvertRates';
import { ModuleSuggestions } from '../../modules/observables/ModuleSuggestions';
import { useConnectedActiveCoin } from '../hooks/useConnectedActiveCoin';

export function WidgetSuggestedTransfers() {
    const { getConvertRates$ } = useModule(ModuleConvertRates);
    const { getSuggestions$ } = useModule(ModuleSuggestions);
    const { getCoinInfo$ } = useModule(ModuleCoinInfo);
    const { fillManualTransfer } = useModule(ModuleFillManualTransferAction);

    const traceId = useTraceId();

    const suggestions = useSyncObservable(
        getSuggestions$(traceId),
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

    const [requestTransfer, requestTransferInProgress] = useConnectedTransferAction(traceId);

    const cbSaveCoinState = useConnectedSaveCoinStateTransfer(traceId);

    const [coin] = useConnectedActiveCoin(EBalanceMonitorLayoutComponents.SuggestedTransfers);

    return (
        <RequestTransferContext.Provider
            value={requestTransferInProgress ? undefined : requestTransfer}
        >
            <TableSuggestions
                coin={coin}
                suggestionsDescriptor={suggestions}
                coinInfoDescriptor={coinInfo}
                convertRatesDescriptor={convertRates}
                onOpenManualTransferTab={fillManualTransfer}
                onSaveCoinState={cbSaveCoinState}
            />
        </RequestTransferContext.Provider>
    );
}
