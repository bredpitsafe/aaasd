import { useModule } from '@frontend/common/src/di/react';
import { useTraceId } from '@frontend/common/src/hooks/useTraceId';
import { useNotifiedValueDescriptorObservable } from '@frontend/common/src/utils/React/useValueDescriptorObservable.ts';

import { useConnectedSaveCoinStateTransfer } from '../../components/hooks/useConnectedSaveCoinStateTransfer';
import { useConnectedTransferAction } from '../../components/hooks/useConnectedTransferAction';
import { RequestTransferContext } from '../../components/RequestTransferContext';
import { TableSuggestions } from '../../components/Tables/TableSuggestions/view';
import { EBalanceMonitorLayoutComponents } from '../../layouts/defs';
import { ModuleFillManualTransferAction } from '../../modules/actions/ModuleFillManualTransferAction';
import { ModuleSubscribeToCoinInfoOnCurrentStage } from '../../modules/actions/ModuleSubscribeToCoinInfoOnCurrentStage.ts';
import { ModuleSubscribeToConvertRatesOnCurrentStage } from '../../modules/actions/ModuleSubscribeToConvertRatesOnCurrentStage.ts';
import { ModuleSubscribeToCurrentSuggestions } from '../../modules/actions/ModuleSubscribeToCurrentSuggestions.ts';
import { useConnectedActiveCoin } from '../hooks/useConnectedActiveCoin';

export function WidgetSuggestedTransfers() {
    const traceId = useTraceId();
    const { fillManualTransfer } = useModule(ModuleFillManualTransferAction);
    const subscribeToCoinInfo = useModule(ModuleSubscribeToCoinInfoOnCurrentStage);
    const subscribeToConvertRates = useModule(ModuleSubscribeToConvertRatesOnCurrentStage);
    const subscribeToCurrentSuggestions = useModule(ModuleSubscribeToCurrentSuggestions);

    const suggestions = useNotifiedValueDescriptorObservable(
        subscribeToCurrentSuggestions(undefined, { traceId }),
    );
    const coinInfo = useNotifiedValueDescriptorObservable(
        subscribeToCoinInfo(undefined, { traceId }),
    );
    const convertRates = useNotifiedValueDescriptorObservable(
        subscribeToConvertRates(undefined, { traceId }),
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
                coinInfoDescriptor={coinInfo}
                suggestionsDescriptor={suggestions}
                convertRatesDescriptor={convertRates}
                onOpenManualTransferTab={fillManualTransfer}
                onSaveCoinState={cbSaveCoinState}
            />
        </RequestTransferContext.Provider>
    );
}
