import { Alert } from '@frontend/common/src/components/Alert';
import { LoadingOverlay } from '@frontend/common/src/components/overlays/LoadingOverlay';
import { useModule } from '@frontend/common/src/di/react';
import { useTraceId } from '@frontend/common/src/hooks/useTraceId';
import { useNotifiedValueDescriptorObservable } from '@frontend/common/src/utils/React/useValueDescriptorObservable.ts';
import {
    isFailValueDescriptor,
    isSyncedValueDescriptor,
} from '@frontend/common/src/utils/ValueDescriptor/utils.ts';

import { SendDataToAnalyse } from '../../components/Forms/SendDataToAnalyse/view';
import { useConnectedSaveCoinStateTransfer } from '../../components/hooks/useConnectedSaveCoinStateTransfer';
import { ModuleSubscribeToCoinInfoOnCurrentStage } from '../../modules/actions/ModuleSubscribeToCoinInfoOnCurrentStage.ts';

export function WidgetSendDataToAnalyse() {
    const traceId = useTraceId();
    const subscribeToCoinInfo = useModule(ModuleSubscribeToCoinInfoOnCurrentStage);
    const coinInfo = useNotifiedValueDescriptorObservable(
        subscribeToCoinInfo(undefined, { traceId }),
    );
    const cbSaveCoinState = useConnectedSaveCoinStateTransfer(traceId);

    if (isFailValueDescriptor(coinInfo)) {
        return <Alert message="Failed to load form data" type="error" showIcon />;
    }

    if (!isSyncedValueDescriptor(coinInfo)) {
        return <LoadingOverlay text="Loading form data..." />;
    }

    return <SendDataToAnalyse coinInfo={coinInfo.value} onSaveCoinState={cbSaveCoinState} />;
}
