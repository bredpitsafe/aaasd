import { useTimeZoneInfoSettings } from '@frontend/common/src/components/Settings/hooks/useTimeZoneSettings';
import { useModule } from '@frontend/common/src/di/react';
import { useTraceId } from '@frontend/common/src/hooks/useTraceId';
import { useNotifiedValueDescriptorObservable } from '@frontend/common/src/utils/React/useValueDescriptorObservable.ts';

import { TableTransfersHistory } from '../../components/Tables/TableTransfersHistory/view';
import { EBalanceMonitorLayoutComponents } from '../../layouts/defs';
import { ModuleFillManualTransferAction } from '../../modules/actions/ModuleFillManualTransferAction';
import { ModuleSubscribeToCurrentTransfersHistory } from '../../modules/actions/ModuleSubscribeToCurrentTransfersHistory.ts';
import { useConnectedActiveCoin } from '../hooks/useConnectedActiveCoin';

export function WidgetTransfersHistory() {
    const traceId = useTraceId();
    const subscribeToTransfersHistory = useModule(ModuleSubscribeToCurrentTransfersHistory);
    const { fillManualTransfer } = useModule(ModuleFillManualTransferAction);

    const history = useNotifiedValueDescriptorObservable(
        subscribeToTransfersHistory(undefined, { traceId }),
    );

    const [{ timeZone }] = useTimeZoneInfoSettings();

    const [coin] = useConnectedActiveCoin(EBalanceMonitorLayoutComponents.TransfersHistory);

    return (
        <TableTransfersHistory
            coin={coin}
            timeZone={timeZone}
            historyDescriptor={history}
            onOpenManualTransferTab={fillManualTransfer}
        />
    );
}
