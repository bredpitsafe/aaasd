import { Alert } from '@frontend/common/src/components/Alert';
import { LoadingOverlay } from '@frontend/common/src/components/overlays/LoadingOverlay';
import { useModule } from '@frontend/common/src/di/react';
import { useTraceId } from '@frontend/common/src/hooks/useTraceId';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { useSyncObservable } from '@frontend/common/src/utils/React/useSyncObservable';
import { isFailDesc, isSyncDesc, UnscDesc } from '@frontend/common/src/utils/ValueDescriptor';
import { useMemo } from 'react';

import { ManualTransfer } from '../../components/Forms/ManualTransfer/view';
import { useConnectedTransferAction } from '../../components/hooks/useConnectedTransferAction';
import { ModuleFillManualTransferAction } from '../../modules/actions/ModuleFillManualTransferAction';
import { ModuleCoinInfo } from '../../modules/observables/ModuleCoinInfo';
import { ModuleConvertRates } from '../../modules/observables/ModuleConvertRates';
import { ModuleManualTransferFormData } from '../../modules/observables/ModuleManualTransferFormData';
import { TConfirmationTransferAction } from '../WidgetTransferConfirmation/defs';

export function WidgetManualTransfer() {
    const { manualTransferFormData$ } = useModule(ModuleManualTransferFormData);
    const { getCoinInfo$ } = useModule(ModuleCoinInfo);
    const { getConvertRates$ } = useModule(ModuleConvertRates);
    const { fillManualTransfer } = useModule(ModuleFillManualTransferAction);

    const traceId = useTraceId();

    const coinInfo = useSyncObservable(
        getCoinInfo$(traceId),
        useMemo(() => UnscDesc(null), []),
    );
    const convertRates = useSyncObservable(
        getConvertRates$(traceId),
        useMemo(() => UnscDesc(null), []),
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

    if (isFailDesc(coinInfo)) {
        return <Alert message="Failed to load form data" type="error" showIcon />;
    }

    if (!isSyncDesc(coinInfo)) {
        return <LoadingOverlay text="Loading form data..." />;
    }

    return (
        <ManualTransfer
            manualTransfer={manualTransfer}
            coinInfo={coinInfo.value}
            convertRatesDescriptor={convertRates}
            requestTransferInProgress={requestTransferInProgress}
            onRequestTransfer={cbRequestTransfer}
            onFormReset={cbResetManualTransferParams}
        />
    );
}
