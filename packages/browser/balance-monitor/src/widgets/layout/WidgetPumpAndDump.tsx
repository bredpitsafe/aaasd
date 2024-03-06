import { useTimeZoneInfoSettings } from '@frontend/common/src/components/Settings/hooks/useTimeZoneSettings';
import { useModule } from '@frontend/common/src/di/react';
import { useTraceId } from '@frontend/common/src/hooks/useTraceId';
import { EApplicationName } from '@frontend/common/src/types/app';
import { useSyncObservable } from '@frontend/common/src/utils/React/useSyncObservable';
import { UnscDesc } from '@frontend/common/src/utils/ValueDescriptor';
import { useMemo } from 'react';

import { TablePumpAndDump } from '../../components/Tables/TablePumpAndDump/view';
import { ModulePumpDumpInfo } from '../../modules/observables/ModulePumpDumpInfo';

export function WidgetPumpAndDump() {
    const { getPumpDumpInfo$ } = useModule(ModulePumpDumpInfo);

    const traceId = useTraceId();

    const pumpDumpInfo = useSyncObservable(
        getPumpDumpInfo$(traceId),
        useMemo(() => UnscDesc(null), []),
    );

    const [{ timeZone }] = useTimeZoneInfoSettings(EApplicationName.BalanceMonitor);

    return <TablePumpAndDump timeZone={timeZone} pumpDumpInfoDescriptor={pumpDumpInfo} />;
}
