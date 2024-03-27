import { useTimeZoneInfoSettings } from '@frontend/common/src/components/Settings/hooks/useTimeZoneSettings';
import { useModule } from '@frontend/common/src/di/react';
import { useTraceId } from '@frontend/common/src/hooks/useTraceId';
import { EApplicationName } from '@frontend/common/src/types/app';
import { useSyncObservable } from '@frontend/common/src/utils/React/useSyncObservable';
import { UnscDesc } from '@frontend/common/src/utils/ValueDescriptor';
import { useMemo } from 'react';

import { TableTransfersHistory } from '../../components/Tables/TableTransfersHistory/view';
import { EBalanceMonitorLayoutComponents } from '../../layouts/defs';
import { ModuleFillManualTransferAction } from '../../modules/actions/ModuleFillManualTransferAction';
import { ModuleTransfersHistory } from '../../modules/observables/ModuleTransfersHistory';
import { useConnectedActiveCoin } from '../hooks/useConnectedActiveCoin';

export function WidgetTransfersHistory() {
    const { getTransfersHistory$ } = useModule(ModuleTransfersHistory);
    const { fillManualTransfer } = useModule(ModuleFillManualTransferAction);

    const traceId = useTraceId();

    const history = useSyncObservable(
        getTransfersHistory$(traceId),
        useMemo(() => UnscDesc(null), []),
    );

    const [{ timeZone }] = useTimeZoneInfoSettings(EApplicationName.BalanceMonitor);

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
