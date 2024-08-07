import { useTimeZoneInfoSettings } from '@frontend/common/src/components/Settings/hooks/useTimeZoneSettings';
import { useModule } from '@frontend/common/src/di/react';
import { useTraceId } from '@frontend/common/src/hooks/useTraceId';
import { useNotifiedValueDescriptorObservable } from '@frontend/common/src/utils/React/useValueDescriptorObservable.ts';

import { TablePumpAndDump } from '../../components/Tables/TablePumpAndDump/view';
import { ModuleSubscribeToCurrentPumpDumpInfo } from '../../modules/actions/ModuleSubscribeToCurrentPumpDumpInfo.ts';

export function WidgetPumpAndDump() {
    const traceId = useTraceId();
    const subscribeToPumpDumpInfo = useModule(ModuleSubscribeToCurrentPumpDumpInfo);

    const pumpDumpInfo = useNotifiedValueDescriptorObservable(
        subscribeToPumpDumpInfo(undefined, { traceId }),
    );

    const [{ timeZone }] = useTimeZoneInfoSettings();

    return <TablePumpAndDump timeZone={timeZone} pumpDumpInfoDescriptor={pumpDumpInfo} />;
}
