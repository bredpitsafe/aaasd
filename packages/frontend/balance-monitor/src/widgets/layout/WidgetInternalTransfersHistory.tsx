import { useTimeZoneInfoSettings } from '@frontend/common/src/components/Settings/hooks/useTimeZoneSettings';
import { useModule } from '@frontend/common/src/di/react';
import { useTraceId } from '@frontend/common/src/hooks/useTraceId';
import { EApplicationName } from '@frontend/common/src/types/app';
import { useSyncObservable } from '@frontend/common/src/utils/React/useSyncObservable';
import { UnscDesc } from '@frontend/common/src/utils/ValueDescriptor';
import { useMemo } from 'react';

import { TableInternalTransfersHistory } from '../../components/Tables/TableInternalTransfersHistory/view';
import { ModuleInternalTransferHistory } from '../../modules/observables/ModuleInternalTransferHistory';

export function WidgetInternalTransfersHistory() {
    const { getInternalTransferHistory$ } = useModule(ModuleInternalTransferHistory);

    const traceId = useTraceId();

    const internalTransferHistory = useSyncObservable(
        getInternalTransferHistory$(traceId),
        useMemo(() => UnscDesc(null), []),
    );

    const [{ timeZone }] = useTimeZoneInfoSettings(EApplicationName.BalanceMonitor);

    return (
        <TableInternalTransfersHistory
            timeZone={timeZone}
            historyDescriptor={internalTransferHistory}
        />
    );
}
