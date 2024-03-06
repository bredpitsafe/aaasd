import { Alert } from '@frontend/common/src/components/Alert';
import { LoadingOverlay } from '@frontend/common/src/components/overlays/LoadingOverlay';
import { useModule } from '@frontend/common/src/di/react';
import { useTraceId } from '@frontend/common/src/hooks/useTraceId';
import { useSyncObservable } from '@frontend/common/src/utils/React/useSyncObservable';
import { isFailDesc, isSyncDesc, UnscDesc } from '@frontend/common/src/utils/ValueDescriptor';
import { useMemo } from 'react';

import { SendDataToAnalyse } from '../../components/Forms/SendDataToAnalyse/view';
import { useConnectedSaveCoinStateTransfer } from '../../components/hooks/useConnectedSaveCoinStateTransfer';
import { ModuleCoinInfo } from '../../modules/observables/ModuleCoinInfo';

export function WidgetSendDataToAnalyse() {
    const { getCoinInfo$ } = useModule(ModuleCoinInfo);

    const traceId = useTraceId();

    const coinInfo = useSyncObservable(
        getCoinInfo$(traceId),
        useMemo(() => UnscDesc(null), []),
    );

    const cbSaveCoinState = useConnectedSaveCoinStateTransfer(traceId);

    if (isFailDesc(coinInfo)) {
        return <Alert message="Failed to load form data" type="error" showIcon />;
    }

    if (!isSyncDesc(coinInfo)) {
        return <LoadingOverlay text="Loading form data..." />;
    }

    return <SendDataToAnalyse coinInfo={coinInfo.value} onSaveCoinState={cbSaveCoinState} />;
}
