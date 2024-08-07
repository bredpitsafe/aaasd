import { Alert } from '@frontend/common/src/components/Alert';
import { LoadingOverlay } from '@frontend/common/src/components/overlays/LoadingOverlay';
import { useModule } from '@frontend/common/src/di/react';
import { useTraceId } from '@frontend/common/src/hooks/useTraceId';
import type { TInternalTransferAction } from '@frontend/common/src/types/domain/balanceMonitor/defs';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { useSyncObservable } from '@frontend/common/src/utils/React/useSyncObservable.ts';
import { useNotifiedValueDescriptorObservable } from '@frontend/common/src/utils/React/useValueDescriptorObservable.ts';
import {
    isFailValueDescriptor,
    isSyncedValueDescriptor,
} from '@frontend/common/src/utils/ValueDescriptor/utils.ts';

import { InternalTransfer } from '../../components/Forms/InternalTransfers/view';
import { useConnectedInternalTransferAction } from '../../components/hooks/useConnectedInternalTransferAction';
import { useShowLowBalanceCoins } from '../../components/Settings/hooks/useShowLowBalanceCoins';
import { ModuleFillInternalTransferAction } from '../../modules/actions/ModuleFillInternalTransferAction';
import { ModuleInternalTransferFormData } from '../../modules/actions/ModuleInternalTransferFormData.ts';
import { ModuleSubscribeToConvertRatesOnCurrentStage } from '../../modules/actions/ModuleSubscribeToConvertRatesOnCurrentStage.ts';
import { ModuleSubscribeToCurrentInternalTransfersCapabilities } from '../../modules/actions/ModuleSubscribeToCurrentInternalTransfersCapabilities.ts';
import { ModuleSubscribeToInternalSubAccountBalancesOnCurrentStage } from '../../modules/actions/ModuleSubscribeToInternalSubAccountBalancesOnCurrentStage.ts';

export function WidgetInternalTransfers() {
    const { internalTransferFormData$ } = useModule(ModuleInternalTransferFormData);
    const subscribeToInternalSubAccountBalances = useModule(
        ModuleSubscribeToInternalSubAccountBalancesOnCurrentStage,
    );
    const subscribeToInternalTransfersInfo = useModule(
        ModuleSubscribeToCurrentInternalTransfersCapabilities,
    );
    const subscribeToConvertRates = useModule(ModuleSubscribeToConvertRatesOnCurrentStage);

    const { fillInternalTransfer } = useModule(ModuleFillInternalTransferAction);

    const traceId = useTraceId();

    const internalTransferInfo = useNotifiedValueDescriptorObservable(
        subscribeToInternalTransfersInfo(undefined, { traceId }),
    );
    const internalSubAccountBalances = useNotifiedValueDescriptorObservable(
        subscribeToInternalSubAccountBalances(undefined, { traceId }),
    );
    const convertRates = useNotifiedValueDescriptorObservable(
        subscribeToConvertRates(undefined, { traceId }),
    );
    const [requestTransfer, requestTransferInProgress] =
        useConnectedInternalTransferAction(traceId);

    const internalTransfer = useSyncObservable(internalTransferFormData$);

    const cbResetInternalTransferParams = useFunction(() => fillInternalTransfer());

    const cbRequestTransfer = useFunction(
        async (props: TInternalTransferAction) => await requestTransfer(props),
    );

    const [showLowBalanceCoins, onToggleShowLowBalanceCoins] = useShowLowBalanceCoins();

    if (
        isFailValueDescriptor(internalTransferInfo) ||
        isFailValueDescriptor(internalSubAccountBalances)
    ) {
        return <Alert message="Failed to load form data" type="error" showIcon />;
    }

    if (
        !isSyncedValueDescriptor(internalTransferInfo) ||
        !isSyncedValueDescriptor(internalSubAccountBalances)
    ) {
        return <LoadingOverlay text="Loading form data..." />;
    }

    return (
        <InternalTransfer
            convertRates={convertRates.value}
            internalTransfer={internalTransfer}
            internalTransferInfo={internalTransferInfo.value}
            internalSubAccountBalances={internalSubAccountBalances.value}
            requestTransferInProgress={requestTransferInProgress}
            onRequestTransfer={cbRequestTransfer}
            onFormReset={cbResetInternalTransferParams}
            showLowBalanceCoins={showLowBalanceCoins}
            onToggleShowLowBalanceCoins={onToggleShowLowBalanceCoins}
        />
    );
}
