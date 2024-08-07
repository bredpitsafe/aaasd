import { useTimeZoneInfoSettings } from '@frontend/common/src/components/Settings/hooks/useTimeZoneSettings';
import { useModule } from '@frontend/common/src/di/react';
import { useTraceId } from '@frontend/common/src/hooks/useTraceId';
import { useNotifiedValueDescriptorObservable } from '@frontend/common/src/utils/React/useValueDescriptorObservable.ts';

import { TableInternalTransfersHistory } from '../../components/Tables/TableInternalTransfersHistory/view';
import { ModuleFillInternalTransferAction } from '../../modules/actions/ModuleFillInternalTransferAction';
import { ModuleSubscribeToInternalTransferHistoryOnCurrentStage } from '../../modules/actions/ModuleSubscribeToInternalTransferHistoryOnCurrentStage.ts';

export function WidgetInternalTransfersHistory() {
    const traceId = useTraceId();
    const { fillInternalTransfer } = useModule(ModuleFillInternalTransferAction);
    const subscribeToInternalTransferHistory = useModule(
        ModuleSubscribeToInternalTransferHistoryOnCurrentStage,
    );

    const internalTransferHistory = useNotifiedValueDescriptorObservable(
        subscribeToInternalTransferHistory(undefined, { traceId }),
    );

    const [{ timeZone }] = useTimeZoneInfoSettings();

    return (
        <TableInternalTransfersHistory
            timeZone={timeZone}
            historyDescriptor={internalTransferHistory}
            onOpenInternalTransferTab={fillInternalTransfer}
        />
    );
}
