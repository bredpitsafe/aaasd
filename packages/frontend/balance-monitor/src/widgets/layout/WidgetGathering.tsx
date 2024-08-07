import { Alert } from '@frontend/common/src/components/Alert';
import { LoadingOverlay } from '@frontend/common/src/components/overlays/LoadingOverlay';
import { useModule } from '@frontend/common/src/di/react';
import { useTraceId } from '@frontend/common/src/hooks/useTraceId';
import { useNotifiedValueDescriptorObservable } from '@frontend/common/src/utils/React/useValueDescriptorObservable.ts';
import {
    isFailValueDescriptor,
    isSyncedValueDescriptor,
} from '@frontend/common/src/utils/ValueDescriptor/utils.ts';

import { Gathering } from '../../components/Forms/Gathering/view';
import { useConnectedStartGathering } from '../../components/hooks/useConnectedStartGathering';
import { useConnectedStopGathering } from '../../components/hooks/useConnectedStopGathering';
import { ModuleRequestGatheringDetailsOnCurrentStage } from '../../modules/actions/ModuleRequestGatheringDetailsOnCurrentStage.ts';
import { ModuleSubscribeToCoinInfoOnCurrentStage } from '../../modules/actions/ModuleSubscribeToCoinInfoOnCurrentStage.ts';
import { ModuleSubscribeToConvertRatesOnCurrentStage } from '../../modules/actions/ModuleSubscribeToConvertRatesOnCurrentStage.ts';

export function WidgetGathering() {
    const traceId = useTraceId();
    const subscribeToCoinInfo = useModule(ModuleSubscribeToCoinInfoOnCurrentStage);
    const subscribeToConvertRates = useModule(ModuleSubscribeToConvertRatesOnCurrentStage);
    const requestGatheringDetails = useModule(ModuleRequestGatheringDetailsOnCurrentStage);

    const coinInfo = useNotifiedValueDescriptorObservable(
        subscribeToCoinInfo(undefined, { traceId }),
    );
    const convertRates = useNotifiedValueDescriptorObservable(
        subscribeToConvertRates(undefined, { traceId }),
    );
    const gatheringDetails = useNotifiedValueDescriptorObservable(
        requestGatheringDetails(undefined, { traceId }),
    );

    const [startGathering, startGatheringInProgress] = useConnectedStartGathering(traceId);
    const [stopGathering, stopGatheringInProgress] = useConnectedStopGathering(traceId);

    if (isFailValueDescriptor(coinInfo) || isFailValueDescriptor(gatheringDetails)) {
        return <Alert message="Failed to load form data" type="error" showIcon />;
    }

    if (!isSyncedValueDescriptor(coinInfo) || !isSyncedValueDescriptor(gatheringDetails)) {
        return <LoadingOverlay text="Loading form data..." />;
    }

    if (gatheringDetails.value.length === 0) {
        return <Alert message="No exchanges for gathering" type="warning" showIcon />;
    }

    return (
        <Gathering
            exchanges={gatheringDetails.value}
            coinInfo={coinInfo.value}
            convertRatesDescriptor={convertRates}
            onStartGathering={startGathering}
            onStopGathering={stopGathering}
            actionInProgress={startGatheringInProgress || stopGatheringInProgress}
        />
    );
}
