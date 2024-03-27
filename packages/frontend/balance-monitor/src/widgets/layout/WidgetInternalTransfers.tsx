import { Alert } from '@frontend/common/src/components/Alert';
import { LoadingOverlay } from '@frontend/common/src/components/overlays/LoadingOverlay';
import { useModule } from '@frontend/common/src/di/react';
import { useTraceId } from '@frontend/common/src/hooks/useTraceId';
import type { TInternalTransferAction } from '@frontend/common/src/types/domain/balanceMonitor/defs';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { useSyncObservable } from '@frontend/common/src/utils/React/useSyncObservable';
import { isFailDesc, isSyncDesc, UnscDesc } from '@frontend/common/src/utils/ValueDescriptor';
import { useMemo } from 'react';

import { InternalTransfer } from '../../components/Forms/InternalTransfers/view';
import { useConnectedInternalTransferAction } from '../../components/hooks/useConnectedInternalTransferAction';
import { useShowLowBalanceCoins } from '../../components/Settings/hooks/useShowLowBalanceCoins';
import { ModuleConvertRates } from '../../modules/observables/ModuleConvertRates';
import { ModuleInternalSubAccountBalances } from '../../modules/observables/ModuleInternalSubAccountBalances';
import { ModuleInternalTransfersInfo } from '../../modules/observables/ModuleInternalTransfersInfo';

export function WidgetInternalTransfers() {
    const { getInternalSubAccountBalances$ } = useModule(ModuleInternalSubAccountBalances);
    const { getInternalTransfersInfo$ } = useModule(ModuleInternalTransfersInfo);
    const { getConvertRates$ } = useModule(ModuleConvertRates);

    const traceId = useTraceId();

    const internalTransferInfo = useSyncObservable(
        getInternalTransfersInfo$(traceId),
        useMemo(() => UnscDesc(null), []),
    );
    const internalSubAccountBalances = useSyncObservable(
        getInternalSubAccountBalances$(traceId),
        useMemo(() => UnscDesc(null), []),
    );
    const convertRates = useSyncObservable(
        getConvertRates$(traceId),
        useMemo(() => UnscDesc(null), []),
    );
    const [requestTransfer, requestTransferInProgress] =
        useConnectedInternalTransferAction(traceId);

    const cbRequestTransfer = useFunction(
        async (props: TInternalTransferAction) => await requestTransfer(props),
    );

    const [showLowBalanceCoins, onToggleShowLowBalanceCoins] = useShowLowBalanceCoins();

    if (isFailDesc(internalTransferInfo) || isFailDesc(internalSubAccountBalances)) {
        return <Alert message="Failed to load form data" type="error" showIcon />;
    }

    if (!isSyncDesc(internalTransferInfo) || !isSyncDesc(internalSubAccountBalances)) {
        return <LoadingOverlay text="Loading form data..." />;
    }

    return (
        <InternalTransfer
            internalTransferInfo={internalTransferInfo.value}
            internalSubAccountBalances={internalSubAccountBalances.value}
            convertRatesDescriptor={convertRates}
            requestTransferInProgress={requestTransferInProgress}
            onRequestTransfer={cbRequestTransfer}
            showLowBalanceCoins={showLowBalanceCoins}
            onToggleShowLowBalanceCoins={onToggleShowLowBalanceCoins}
        />
    );
}
