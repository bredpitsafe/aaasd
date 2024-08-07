import { Alert } from '@frontend/common/src/components/Alert';
import { LoadingOverlay } from '@frontend/common/src/components/overlays/LoadingOverlay';
import { useModule } from '@frontend/common/src/di/react';
import { useTraceId } from '@frontend/common/src/hooks/useTraceId';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { useSyncObservable } from '@frontend/common/src/utils/React/useSyncObservable';
import { useNotifiedValueDescriptorObservable } from '@frontend/common/src/utils/React/useValueDescriptorObservable.ts';
import {
    isFailValueDescriptor,
    isSyncedValueDescriptor,
} from '@frontend/common/src/utils/ValueDescriptor/utils.ts';

import { ManualTransfer } from '../../components/Forms/ManualTransfer/view';
import { useConnectedTransferAction } from '../../components/hooks/useConnectedTransferAction';
import { ModuleFillManualTransferAction } from '../../modules/actions/ModuleFillManualTransferAction';
import { ModuleManualTransferFormData } from '../../modules/actions/ModuleManualTransferFormData.ts';
import { ModuleSubscribeToCoinInfoOnCurrentStage } from '../../modules/actions/ModuleSubscribeToCoinInfoOnCurrentStage.ts';
import { ModuleSubscribeToConvertRatesOnCurrentStage } from '../../modules/actions/ModuleSubscribeToConvertRatesOnCurrentStage.ts';
import type { TConfirmationTransferAction } from '../WidgetTransferConfirmation/defs';

export function WidgetManualTransfer() {
    const traceId = useTraceId();
    const subscribeToCoinInfo = useModule(ModuleSubscribeToCoinInfoOnCurrentStage);
    const subscribeToConvertRates = useModule(ModuleSubscribeToConvertRatesOnCurrentStage);
    const { manualTransferFormData$ } = useModule(ModuleManualTransferFormData);

    const { fillManualTransfer } = useModule(ModuleFillManualTransferAction);

    const coinInfo = useNotifiedValueDescriptorObservable(
        subscribeToCoinInfo(undefined, { traceId }),
    );
    const convertRates = useNotifiedValueDescriptorObservable(
        subscribeToConvertRates(undefined, { traceId }),
    );
    const manualTransfer = useSyncObservable(manualTransferFormData$);

    const cbResetManualTransferParams = useFunction(() => fillManualTransfer());

    const [requestTransfer, requestTransferInProgress] = useConnectedTransferAction(traceId);

    const cbRequestTransfer = useFunction(async (props: TConfirmationTransferAction) => {
        if (await requestTransfer(props)) {
            await cbResetManualTransferParams();
            return true;
        }
        return false;
    });

    if (isFailValueDescriptor(coinInfo)) {
        return <Alert message="Failed to load form data" type="error" showIcon />;
    }

    if (!isSyncedValueDescriptor(coinInfo)) {
        return <LoadingOverlay text="Loading form data..." />;
    }

    return (
        <ManualTransfer
            manualTransfer={manualTransfer}
            coinInfo={coinInfo.value}
            convertRates={convertRates.value}
            requestTransferInProgress={requestTransferInProgress}
            onRequestTransfer={cbRequestTransfer}
            onFormReset={cbResetManualTransferParams}
        />
    );
}
