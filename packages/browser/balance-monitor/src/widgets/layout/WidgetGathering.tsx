import { Alert } from '@frontend/common/src/components/Alert';
import { LoadingOverlay } from '@frontend/common/src/components/overlays/LoadingOverlay';
import { useModule } from '@frontend/common/src/di/react';
import { useTraceId } from '@frontend/common/src/hooks/useTraceId';
import { useValueDescriptorObservableDeprecated } from '@frontend/common/src/utils/React/useValueDescriptorObservableDeprecated';
import { isFailDesc, isSyncDesc } from '@frontend/common/src/utils/ValueDescriptor';

import { Gathering } from '../../components/Forms/Gathering/view';
import { useConnectedStartGathering } from '../../components/hooks/useConnectedStartGathering';
import { useConnectedStopGathering } from '../../components/hooks/useConnectedStopGathering';
import { ModuleCoinInfo } from '../../modules/observables/ModuleCoinInfo';
import { ModuleConvertRates } from '../../modules/observables/ModuleConvertRates';
import { ModuleGatheringDetails } from '../../modules/observables/ModuleGatheringDetails';

export function WidgetGathering() {
    const { getCoinInfo$ } = useModule(ModuleCoinInfo);
    const { getConvertRates$ } = useModule(ModuleConvertRates);
    const { getGatheringDetails$ } = useModule(ModuleGatheringDetails);

    const traceId = useTraceId();

    const coinInfo = useValueDescriptorObservableDeprecated(getCoinInfo$(traceId));
    const convertRates = useValueDescriptorObservableDeprecated(getConvertRates$(traceId));
    const gatheringDetails = useValueDescriptorObservableDeprecated(getGatheringDetails$(traceId));

    const [startGathering, startGatheringInProgress] = useConnectedStartGathering(traceId);
    const [stopGathering, stopGatheringInProgress] = useConnectedStopGathering(traceId);

    if (isFailDesc(coinInfo) || isFailDesc(gatheringDetails)) {
        return <Alert message="Failed to load form data" type="error" showIcon />;
    }

    if (!isSyncDesc(coinInfo) || !isSyncDesc(gatheringDetails)) {
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
